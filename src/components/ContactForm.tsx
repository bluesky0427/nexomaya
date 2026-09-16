"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { contactLimits, contactReasons } from "@/lib/site";
import { cn } from "@/lib/cn";
import Turnstile, { turnstileSiteKey } from "./Turnstile";

type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<
  Record<"name" | "email" | "reason" | "message" | "turnstile", string>
>;

const inputBase =
  "w-full rounded-lg border bg-white px-4 py-3 text-ink shadow-sm transition-colors placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest/30";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState("");
  // Changing this remounts the Turnstile widget to issue a fresh token.
  const [turnstileKey, setTurnstileKey] = useState(0);

  function validate(data: {
    name: string;
    email: string;
    reason: string;
    message: string;
  }): FieldErrors {
    const next: FieldErrors = {};
    if (!data.name.trim()) next.name = "Please enter your name.";
    if (!data.email.trim()) {
      next.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!data.reason) next.reason = "Please select a reason for contact.";
    if (!data.message.trim()) {
      next.message = "Please enter a message.";
    } else if (data.message.trim().length < contactLimits.messageMin) {
      next.message = `Please provide a little more detail (at least ${contactLimits.messageMin} characters).`;
    } else if (data.message.trim().length > contactLimits.messageMax) {
      next.message = `Please keep your message under ${contactLimits.messageMax.toLocaleString("en-US")} characters.`;
    }
    if (turnstileSiteKey && !turnstileToken) {
      next.turnstile = "Please complete the verification check.";
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      reason: String(formData.get("reason") ?? ""),
      message: String(formData.get("message") ?? ""),
      // Honeypot field — must stay empty. Bots tend to fill every field.
      website: String(formData.get("website") ?? ""),
      turnstileToken,
    };

    const validationErrors = validate(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      setTurnstileToken("");
      form.reset();
    } catch (err) {
      setStatus("error");
      // The token was consumed by the server; get a new one for the retry.
      setTurnstileToken("");
      setTurnstileKey((k) => k + 1);
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-sage/40 bg-sage/5 p-8 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m5 12 4.5 4.5L19 7" />
          </svg>
        </div>
        <h3 className="mt-5 text-xl font-semibold text-forest">
          Message received
        </h3>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-light">
          Thank you for contacting Nexomaya Technology Group. Your message has been
          received, and we will get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-forest underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {status === "error" && serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-forest">
            Name <span className="text-ochre-dark">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={contactLimits.name}
            placeholder="Your full name"
            className={cn(inputBase, errors.name ? "border-red-300" : "border-forest-100")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1.5 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-forest">
            Email <span className="text-ochre-dark">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={contactLimits.email}
            placeholder="you@example.com"
            className={cn(inputBase, errors.email ? "border-red-300" : "border-forest-100")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="company" className="mb-2 block text-sm font-medium text-forest">
          Company / Organization{" "}
          <span className="text-ink-muted">(optional)</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          maxLength={contactLimits.company}
          placeholder="Your company or organization"
          className={cn(inputBase, "border-forest-100")}
        />
      </div>

      <div>
        <label htmlFor="reason" className="mb-2 block text-sm font-medium text-forest">
          Reason for Contact <span className="text-ochre-dark">*</span>
        </label>
        <select
          id="reason"
          name="reason"
          required
          defaultValue=""
          className={cn(
            inputBase,
            "appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
            errors.reason ? "border-red-300" : "border-forest-100"
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237B8794' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
          aria-invalid={Boolean(errors.reason)}
          aria-describedby={errors.reason ? "reason-error" : undefined}
        >
          <option value="" disabled>
            Select a reason…
          </option>
          {contactReasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
        {errors.reason && (
          <p id="reason-error" className="mt-1.5 text-sm text-red-600">
            {errors.reason}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-forest">
          Message <span className="text-ochre-dark">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={contactLimits.messageMax}
          placeholder="Tell us a little about your project, idea, or how we can help…"
          className={cn(
            inputBase,
            "resize-y",
            errors.message ? "border-red-300" : "border-forest-100"
          )}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 text-sm text-red-600">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from real users, tempting to bots. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {turnstileSiteKey && (
        <div>
          <Turnstile key={turnstileKey} onToken={setTurnstileToken} />
          {errors.turnstile && (
            <p className="mt-1.5 text-sm text-red-600">{errors.turnstile}</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-8 py-4 text-base font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sending…
          </>
        ) : (
          "Send Message"
        )}
      </button>

      <p className="text-xs leading-relaxed text-ink-muted">
        By submitting this form you agree to be contacted by Nexomaya Technology Group
        regarding your inquiry. We use your information only as described in our{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-forest">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
