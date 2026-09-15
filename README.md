# Nexomaya Technology Group — Website

The official marketing website for **Nexomaya Technology Group**
_Connecting Technology, Human Skill, and Opportunity._

Custom-coded with **Next.js (App Router) + TypeScript + Tailwind CSS**, fully
responsive, SEO-friendly, and ready to deploy on **Vercel** and connect to
**nexomaya.com**.

---

## 1. Tech stack

| Area        | Choice                                   |
| ----------- | ---------------------------------------- |
| Framework   | Next.js 15 (App Router) + React 19       |
| Language    | TypeScript                               |
| Styling     | Tailwind CSS                             |
| Fonts       | Inter (sans) + Playfair Display (serif)  |
| Email       | Resend (transactional email)             |
| Hosting     | Vercel                                   |

---

## 2. Project structure

```
nexomaya/
├── .env.example                 # Copy to .env.local and fill in real values
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts           # Brand colors, fonts, animations
├── tsconfig.json
├── README.md
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout: header, footer, fonts, SEO, JSON-LD
    │   ├── globals.css          # Tailwind layers + base typography
    │   ├── page.tsx             # Home
    │   ├── about/page.tsx       # About
    │   ├── what-we-do/page.tsx  # What We Do (services)
    │   ├── our-philosophy/page.tsx
    │   ├── contact/page.tsx     # Contact (form + details)
    │   ├── privacy/page.tsx     # Privacy Policy (APPI)
    │   ├── not-found.tsx        # Custom 404
    │   ├── opengraph-image.tsx  # Share preview image (generated at build)
    │   ├── twitter-image.tsx    # Same image for X
    │   ├── sitemap.ts           # /sitemap.xml
    │   ├── robots.ts            # /robots.txt
    │   ├── manifest.ts          # PWA manifest
    │   ├── icon.svg             # Favicon
    │   └── api/
    │       └── contact/route.ts # Contact form API (validation + email)
    ├── components/
    │   ├── Header.tsx           # Sticky nav + mobile menu + CTA
    │   ├── Footer.tsx           # Footer on every page
    │   ├── ContactForm.tsx      # Client form with validation + states
    │   ├── Turnstile.tsx        # Cloudflare Turnstile bot-check widget
    │   ├── PageHero.tsx         # Dark hero band for interior pages
    │   ├── CTASection.tsx       # Reusable closing call-to-action
    │   ├── SectionHeading.tsx   # Eyebrow + title + accent rule
    │   ├── Container.tsx        # Max-width wrapper
    │   ├── Button.tsx           # Link/button with variants
    │   └── Icons.tsx            # Inline SVG icon set (no icon dependency)
    └── lib/
        ├── site.ts             # Brand strings, nav, contact reasons + limits
        ├── content.ts          # Services data (shared across pages)
        ├── metadata.ts         # Per-page title, canonical, and share tags
        ├── rate-limit.ts       # In-memory rate limiter for the contact API
        └── cn.ts               # className helper
```

---

## 3. Local development

> Requires **Node.js 18.18+** (Node 20 LTS or newer recommended).

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env.local
#   (Windows PowerShell: Copy-Item .env.example .env.local)

# 3. Start the dev server
npm run dev
```

Open **http://localhost:3000**.

Other scripts:

```bash
npm run build   # Production build
npm start       # Run the production build locally
npm run lint    # Lint
```

> The contact form works **without** an email key during development — if
> `RESEND_API_KEY` is not set, submissions are logged to the server console and
> the success message is still shown. (In production a missing key returns an
> error instead.) Configure Resend (below) to send real
> emails.

---

## 4. Environment variables

Copy `.env.example` → `.env.local` for local dev, and add the same keys in
Vercel for production. See `.env.example` for inline documentation.

| Variable                       | Purpose                                                |
| ------------------------------ | ------------------------------------------------------ |
| `RESEND_API_KEY`               | Resend API key (email sending). **Never commit this.** |
| `CONTACT_TO_EMAIL`             | Inbox that receives contact submissions.               |
| `CONTACT_FROM_EMAIL`           | "From" address for the internal notification.          |
| `CONTACT_THANK_YOU_FROM_EMAIL` | "From" address for the visitor thank-you email.        |
| `NEXT_PUBLIC_SITE_URL`         | Public site URL (canonical/sitemap/SEO).               |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (optional bot check).  |
| `TURNSTILE_SECRET_KEY`         | Cloudflare Turnstile secret key. Set with the site key. |

### Contact form protection

- **Rate limits:** 5 submissions per IP per 10 minutes, and at most 3 thank-you
  emails per visitor address per hour (`src/lib/rate-limit.ts`). Limits are kept
  in server memory, so they are best-effort on serverless hosting.
- **Bot check:** when both Turnstile keys are set, the form shows a Cloudflare
  Turnstile widget and the API rejects submissions without a valid token.
- **Length limits:** shared by the form and API via `contactLimits` in `src/lib/site.ts`.
- **Missing email key:** in production the API returns an error (and logs it)
  instead of pretending the message was sent. In development it logs the
  submission to the console.

---

## 5. Where to add the email API key

The contact API route (`src/app/api/contact/route.ts`) reads the key from the
environment — it is **never hard-coded**:

```ts
const apiKey = process.env.RESEND_API_KEY;
```

To enable email:

1. Create a free account at **https://resend.com**.
2. **Verify the sending domain** `nexomaya.com` in the Resend
   dashboard (Domains → Add Domain), then add the DNS records it shows in
   GoDaddy (see §8). Sending fails until the domain shows as **Verified**.
3. Create an API key (**API Keys → Create API Key**).
4. Add it to:
   - **Local:** `.env.local` → `RESEND_API_KEY=re_...`
   - **Vercel:** Project → Settings → Environment Variables → add `RESEND_API_KEY`
     (and the `*_EMAIL` variables), then redeploy.

> Prefer a different provider (SendGrid, Postmark, AWS SES, Nodemailer/SMTP)?
> Swap the two `resend.emails.send(...)` calls in the API route for your
> provider's SDK. The validation and templates above them stay the same.

---

## 6. Deploying to Vercel

### Option A — Git (recommended)

1. Push this project to a GitHub/GitLab/Bitbucket repository.
2. Go to **https://vercel.com/new** and **Import** the repository.
3. Vercel auto-detects Next.js — no build settings to change
   (Build: `next build`, Output: `.next`).
4. Under **Environment Variables**, add the keys from §4
   (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`,
   `CONTACT_THANK_YOU_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`, and the two
   Turnstile keys).
5. Click **Deploy**. You'll get a `*.vercel.app` URL to preview.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel          # first run links/creates the project
vercel --prod   # deploy to production
```

Add environment variables with `vercel env add RESEND_API_KEY` (repeat per key).

---

## 7. Connecting the domain nexomaya.com (GoDaddy)

`nexomaya.com` is registered at **GoDaddy** and its DNS is managed there. Keep
GoDaddy's nameservers and edit the records in GoDaddy — you don't need to move
DNS anywhere else.

Open the DNS editor: **GoDaddy → My Products → Domains → nexomaya.com → DNS**.

1. In Vercel: **Project → Settings → Domains → Add** `nexomaya.com`
   (add `www.nexomaya.com` too).
2. Vercel shows the exact records to create. In GoDaddy's DNS records:

   | Type    | Name  | Value                                                 |
   | ------- | ----- | ----------------------------------------------------- |
   | `A`     | `@`   | The IP Vercel shows (e.g. `76.76.21.21`)              |
   | `CNAME` | `www` | The target Vercel shows (e.g. `cname.vercel-dns.com`) |

   GoDaddy specifics:
   - A new GoDaddy domain already has an `A` record for `@` pointing to
     **"Parked"**, and a `CNAME` for `www`. **Edit those two records** to the
     Vercel values instead of adding new ones — a leftover parked `A` record
     sends some visitors to the GoDaddy parking page.
   - If **Forwarding** is set up for the domain in GoDaddy, remove it.
   - Always use the **exact values Vercel displays for your project**; Vercel
     sometimes gives project-specific values instead of the examples above.
3. Wait for DNS to propagate (minutes to a few hours). Vercel issues the HTTPS
   certificate automatically once the records resolve.
4. In Vercel's Domains settings, choose the primary domain and redirect the
   other. This site uses **`www.nexomaya.com` as primary** (`nexomaya.com`
   redirects to it), so `NEXT_PUBLIC_SITE_URL` is `https://www.nexomaya.com`.

---

## 8. Email DNS records (GoDaddy)

The domain has no email service yet, so there are no existing email records to
protect. Two separate things are needed:

### 8a. Sending — Resend (contact form emails)

After adding `nexomaya.com` in Resend, add the records it shows. They look like
this (copy the real values from Resend — the DKIM key and region are unique to
your account):

| Type  | Name                | Value                                          | Priority |
| ----- | ------------------- | ---------------------------------------------- | -------- |
| `MX`  | `send`              | `feedback-smtp.<region>.amazonses.com`         | `10`     |
| `TXT` | `send`              | `v=spf1 include:amazonses.com ~all`            |          |
| `TXT` | `resend._domainkey` | `p=MIGfMA0GCSq...` (long DKIM key from Resend) |          |
| `TXT` | `_dmarc`            | `v=DMARC1; p=none;` (recommended)              |          |

> **GoDaddy tip:** in the **Name** field enter only the part before the domain
> — `send`, not `send.nexomaya.com`. GoDaddy adds `.nexomaya.com` itself; typing
> the full name creates `send.nexomaya.com.nexomaya.com` and verification fails.

These records live on the `send` subdomain, so they never conflict with the
mailbox records below. Then click **Verify** in Resend.

### 8b. Receiving — no @nexomaya.com mailbox (by design)

The domain has **no mailbox**, so mail sent to any `@nexomaya.com` address
bounces. The site is built around that:

- Visitors reach the company through the **contact form** (or the meeting
  booking link). No email address is shown on the site, in the structured data,
  or in the privacy policy.
- Form submissions are delivered to `CONTACT_TO_EMAIL` — set it to an inbox you
  check, such as a Gmail address. The API refuses submissions in production if it
  is missing.
- Confirmation emails come from `no-reply@nexomaya.com` and tell visitors that
  replies aren't received and to use the contact form instead.

If you add a mailbox later (Google Workspace, Microsoft 365, Zoho Mail) or email
forwarding (e.g. ImprovMX), add its `MX` and SPF `TXT` records on `@` in GoDaddy,
plus its DKIM record — the domain's DMARC policy is `quarantine`, so mail from
it without DKIM may land in spam. Then you can show the address on the site again.

> **SPF note:** a hostname may have only **one** SPF `TXT` record. Resend's SPF
> is on `send`, and your mailbox provider's SPF goes on `@`, so they don't
> collide. If you later add another service that sends from `@`, merge its
> `include:` into the existing `@` SPF record instead of adding a second one.

---

## 9. Pages & SEO

| Page           | Route             | Title                                        |
| -------------- | ----------------- | -------------------------------------------- |
| Home           | `/`               | Nexomaya Technology Group \| Technology, ... |
| About          | `/about`          | About \| Nexomaya Technology Group           |
| What We Do     | `/what-we-do`     | Services \| Nexomaya Technology Group        |
| Our Philosophy | `/our-philosophy` | Our Philosophy \| Nexomaya Technology Group  |
| Contact        | `/contact`        | Contact \| Nexomaya Technology Group         |
| Privacy Policy | `/privacy`        | Privacy Policy \| Nexomaya Technology Group  |

Each page sets its own `title` + `description` via the Next.js Metadata API,
uses semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`,
headings), and the site ships `sitemap.xml`, `robots.txt`, a web manifest, and
Organization JSON-LD structured data.

---

## 10. Brand & design notes

- **Colors:** Navy `#0B2545` (primary), white, dark gray `#1F2933` (ink), with
  a restrained **gold** `#C8A04D` accent (a muted **sage green** is also defined
  in `tailwind.config.ts` if you prefer a green accent — swap `gold` for `sage`).
- **Typography:** Playfair Display for headings (authority), Inter for body
  (clarity).
- **Layout:** Spacious, max-width 1200px, generous vertical rhythm.
- **Responsive:** Mobile-first; tested across mobile, tablet, and desktop
  breakpoints with an accessible mobile menu and skip-to-content link.

---

_Together, we create new value._
