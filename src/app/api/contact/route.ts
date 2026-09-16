import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactLimits, contactReasons } from "@/lib/site";
import { createRateLimiter } from "@/lib/rate-limit";

/**
 * Contact form API route.
 * -----------------------------------------------------------------------------
 * POST /api/contact
 *
 * Responsibilities:
 *   1. Validate required fields, lengths, and email format on the server (never
 *      trust the client alone).
 *   2. Reject abuse: honeypot field, per-IP and per-recipient rate limits, and
 *      Cloudflare Turnstile verification when TURNSTILE_SECRET_KEY is set.
 *   3. Send an internal notification email to CONTACT_TO_EMAIL.
 *   4. Send an automatic thank-you email to the visitor.
 *
 * Email is sent through Resend (https://resend.com). The API key is read from
 * the RESEND_API_KEY environment variable — it is NEVER hard-coded here.
 *
 *   >>> WHERE TO ADD YOUR EMAIL API KEY <<<
 *   Add RESEND_API_KEY (and the *_EMAIL variables) to:
 *     • Local dev:  .env.local   (copy from .env.example)
 *     • Production:  Vercel → Project → Settings → Environment Variables
 *   Do not commit real keys. See README.md and .env.example for details.
 * -----------------------------------------------------------------------------
 */

// Run on the Node.js runtime (the Resend SDK is not Edge-compatible).
export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  email?: string;
  company?: string;
  reason?: string;
  message?: string;
  website?: string; // honeypot — must be empty
  turnstileToken?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SEND_FAILED_MESSAGE =
  "We could not send your message right now. Please try again in a few minutes, or book a meeting with us instead.";

// Each IP may submit 5 times per 10 minutes, and each visitor address may
// receive at most 3 thank-you emails per hour. The second limit stops the form
// from being used to flood someone else's inbox from our domain.
const ipLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });
const recipientLimiter = createRateLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });

function tooManyRequests() {
  return NextResponse.json(
    { error: "Too many messages sent. Please wait a while and try again." },
    { status: 429 }
  );
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Verifies a Cloudflare Turnstile token. See https://developers.cloudflare.com/turnstile/ */
async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string
): Promise<boolean> {
  if (!token) return false;
  const params = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") params.set("remoteip", ip);
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: params, cache: "no-store" }
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("[contact] Turnstile verification request failed:", error);
    return false;
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!ipLimiter(ip)) return tooManyRequests();

  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request format." },
      { status: 400 }
    );
  }

  const field = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";
  const name = field(body.name);
  const email = field(body.email);
  const company = field(body.company);
  const reason = field(body.reason);
  const message = field(body.message);
  const honeypot = field(body.website);
  const turnstileToken = field(body.turnstileToken);

  // 1. Spam trap: if the hidden honeypot field is filled, silently accept
  //    (pretend success) so bots don't learn they were caught.
  if (honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 2. Required-field validation.
  const errors: string[] = [];
  if (!name) {
    errors.push("Name is required.");
  } else if (name.length > contactLimits.name) {
    errors.push("Name is too long.");
  }
  if (!email) {
    errors.push("Email is required.");
  } else if (email.length > contactLimits.email || !EMAIL_REGEX.test(email)) {
    errors.push("A valid email address is required.");
  }
  if (company.length > contactLimits.company) {
    errors.push("Company name is too long.");
  }
  if (!reason) {
    errors.push("Reason for contact is required.");
  } else if (!contactReasons.includes(reason as (typeof contactReasons)[number])) {
    errors.push("Reason for contact is invalid.");
  }
  if (!message) {
    errors.push("Message is required.");
  } else if (message.length < contactLimits.messageMin) {
    // Basic anti-spam: reject suspiciously short / empty-ish messages.
    errors.push("Message is too short.");
  } else if (message.length > contactLimits.messageMax) {
    errors.push("Message is too long.");
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors.join(" ") },
      { status: 422 }
    );
  }

  // Bot check — enforced whenever the Turnstile secret is configured.
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!(await verifyTurnstile(turnstileSecret, turnstileToken, ip))) {
      return NextResponse.json(
        { error: "Verification failed. Please complete the check and try again." },
        { status: 403 }
      );
    }
  } else if (process.env.NODE_ENV === "production") {
    console.warn(
      "[contact] TURNSTILE_SECRET_KEY is not set — the contact form is only " +
        "protected by rate limiting. Configure Turnstile to block bots."
    );
  }

  if (!recipientLimiter(email.toLowerCase())) return tooManyRequests();

  // Read configuration from environment variables.
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL ?? "no-reply@nexomaya.com";
  const thankYouFrom =
    process.env.CONTACT_THANK_YOU_FROM_EMAIL ??
    "no-reply@nexomaya.com";

  if (!apiKey || !toEmail) {
    // In production missing configuration means enquiries would be silently
    // lost, so fail loudly instead of pretending the message was sent.
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set — cannot " +
          "deliver contact form submissions. Add them in the Vercel project " +
          "settings and redeploy."
      );
      return NextResponse.json({ error: SEND_FAILED_MESSAGE }, { status: 503 });
    }

    // In development, log the submission instead of sending email.
    console.warn(
      "[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set — skipping email send (development only).\n" +
        "Submission received:",
      { name, email, company, reason, message }
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const resend = new Resend(apiKey);

  try {
    // ---- 3a. Internal notification email (to the company inbox) ----
    // NOTE: the Resend SDK does NOT throw on API errors (e.g. an unverified
    // sending domain). It resolves with `{ data, error }`, so we must inspect
    // `error` ourselves — otherwise failed sends look like successes.
    const notify = await resend.emails.send({
      from: `Nexomaya Technology Group <${fromEmail}>`,
      to: [toEmail],
      replyTo: email, // replying goes straight to the visitor
      subject: `New contact inquiry: ${reason} — ${name}`,
      text: buildNotificationText({ name, email, company, reason, message }),
      html: buildNotificationHtml({ name, email, company, reason, message }),
    });

    if (notify.error) {
      console.error("[contact] Resend rejected the notification email:", notify.error);
      return NextResponse.json({ error: SEND_FAILED_MESSAGE }, { status: 502 });
    }

    // ---- 3b. Automatic thank-you email (to the visitor) ----
    // Best-effort: if this fails we still treat the submission as received,
    // since the company has already been notified above.
    const thankYou = await resend.emails.send({
      from: `Nexomaya Technology Group <${thankYouFrom}>`,
      to: [email],
      subject: "Thank you for contacting Nexomaya Technology Group",
      text: THANK_YOU_TEXT,
      html: THANK_YOU_HTML,
    });

    if (thankYou.error) {
      console.error("[contact] Resend rejected the thank-you email:", thankYou.error);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[contact] Failed to send email via Resend:", error);
    return NextResponse.json({ error: SEND_FAILED_MESSAGE }, { status: 502 });
  }
}

/* -------------------------------------------------------------------------- */
/*  Email templates                                                           */
/* -------------------------------------------------------------------------- */

function buildNotificationText(data: {
  name: string;
  email: string;
  company: string;
  reason: string;
  message: string;
}): string {
  return [
    "New contact form submission — Nexomaya Technology Group",
    "",
    `Name:    ${data.name}`,
    `Email:   ${data.email}`,
    `Company: ${data.company || "—"}`,
    `Reason:  ${data.reason}`,
    "",
    "Message:",
    data.message,
  ].join("\n");
}

function buildNotificationHtml(data: {
  name: string;
  email: string;
  company: string;
  reason: string;
  message: string;
}): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#1F2419;max-width:600px;margin:0 auto;">
    <h2 style="color:#3C4624;">New contact inquiry</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;color:#6A7261;width:120px;">Name</td><td style="padding:6px 0;font-weight:bold;">${esc(data.name)}</td></tr>
      <tr><td style="padding:6px 0;color:#6A7261;">Email</td><td style="padding:6px 0;"><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td></tr>
      <tr><td style="padding:6px 0;color:#6A7261;">Company</td><td style="padding:6px 0;">${esc(data.company || "—")}</td></tr>
      <tr><td style="padding:6px 0;color:#6A7261;">Reason</td><td style="padding:6px 0;">${esc(data.reason)}</td></tr>
    </table>
    <h3 style="color:#3C4624;margin-top:24px;">Message</h3>
    <p style="white-space:pre-wrap;line-height:1.6;">${esc(data.message)}</p>
  </div>`;
}

const THANK_YOU_TEXT = `Hello,

Thank you for contacting Nexomaya Technology Group.

We have received your message and appreciate your interest in connecting with us. Our team will review your inquiry and get back to you as soon as possible.

Nexomaya Technology Group connects technology, human skill, and opportunity to create new value. We look forward to learning more about how we may work together.

Best regards,
Nexomaya Technology Group

This is an automated message, and replies to this address are not received. To add details to your inquiry, please use the contact form at https://www.nexomaya.com/contact.`;

const THANK_YOU_HTML = `
<div style="font-family:Arial,Helvetica,sans-serif;color:#1F2419;max-width:600px;margin:0 auto;line-height:1.6;">
  <div style="background:#3C4624;padding:28px 24px;border-radius:12px 12px 0 0;">
    <h1 style="color:#ffffff;margin:0;font-size:20px;">Nexomaya Technology Group</h1>
    <p style="color:#D8B871;margin:6px 0 0;font-size:13px;">Connecting Technology, Human Skill, and Opportunity</p>
  </div>
  <div style="padding:28px 24px;border:1px solid #E6EBD8;border-top:none;border-radius:0 0 12px 12px;">
    <p>Hello,</p>
    <p>Thank you for contacting Nexomaya Technology Group.</p>
    <p>We have received your message and appreciate your interest in connecting with us. Our team will review your inquiry and get back to you as soon as possible.</p>
    <p>Nexomaya Technology Group connects technology, human skill, and opportunity to create new value. We look forward to learning more about how we may work together.</p>
    <p style="margin-top:24px;">Best regards,<br/><strong>Nexomaya Technology Group</strong></p>
    <hr style="border:none;border-top:1px solid #E6EBD8;margin:24px 0;" />
    <p style="font-size:12px;color:#6A7261;">This is an automated message, and replies to this address are not received. To add details to your inquiry, please use the <a href="https://www.nexomaya.com/contact" style="color:#8A6524;">contact form</a>.</p>
  </div>
</div>`;
