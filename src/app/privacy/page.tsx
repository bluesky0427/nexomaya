import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Nexomaya Technology Group collects, uses, and protects personal information, in accordance with Japan's Act on the Protection of Personal Information.",
  path: "/privacy",
});

/*
 * This policy describes what the site actually does (see
 * src/app/api/contact/route.ts). If you add analytics, a newsletter, new
 * service providers, or new forms, update the relevant sections.
 */

const EFFECTIVE_DATE = "September 20, 2026";

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Business Operator",
    body: (
      <dl className="grid gap-2 sm:grid-cols-[12rem_1fr]">
        <dt className="font-medium text-forest">Company</dt>
        <dd>{siteConfig.name}</dd>
        <dt className="font-medium text-forest">Address</dt>
        <dd>{siteConfig.address.full}</dd>
        <dt className="font-medium text-forest">Representative</dt>
        <dd>
          Provided without delay upon request through our{" "}
          <Link href="/contact" className="text-forest underline underline-offset-4 hover:text-ochre-dark">
            contact form
          </Link>
          .
        </dd>
        <dt className="font-medium text-forest">Contact</dt>
        <dd>
          Our{" "}
          <Link href="/contact" className="text-forest underline underline-offset-4 hover:text-ochre-dark">
            contact form
          </Link>
        </dd>
      </dl>
    ),
  },
  {
    title: "2. Information We Collect",
    body: (
      <>
        <p>
          <strong className="text-forest">Information you give us.</strong> When
          you use our contact form, we collect your name, email address,
          company or organization (optional), reason for contact, and message.
          If you book a meeting or correspond with us, we receive the
          information you include.
        </p>
        <p>
          <strong className="text-forest">Technical information.</strong> When
          you visit the site or submit the form, our hosting provider
          processes your IP address, browser type, and request details. We use
          your IP address briefly to limit repeated form submissions, and, where
          enabled, a bot-protection check may process information about your
          browser. We do not use analytics or advertising cookies.
        </p>
      </>
    ),
  },
  {
    title: "3. How We Use Your Information",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>To respond to your inquiry and communicate with you about it.</li>
        <li>
          To discuss and provide our services, partnerships, and collaboration
          opportunities you have asked about.
        </li>
        <li>To send an automatic confirmation that we received your message.</li>
        <li>
          To protect the site and form from spam, abuse, and security threats.
        </li>
        <li>To comply with legal obligations.</li>
      </ul>
    ),
  },
  {
    title: "4. Service Providers and International Transfers",
    body: (
      <>
        <p>
          We entrust the handling of personal information to service providers
          only as needed to operate this website and respond to you:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-forest">Website hosting</strong> — Vercel Inc.
            (United States)
          </li>
          <li>
            <strong className="text-forest">Email delivery</strong> — Resend, which
            sends form notifications and confirmation emails using Amazon Web
            Services (United States)
          </li>
          <li>
            <strong className="text-forest">Receiving and replying to inquiries</strong>{" "}
            — Google LLC (Gmail, United States)
          </li>
          <li>
            <strong className="text-forest">Bot protection</strong> (where enabled)
            — Cloudflare, Inc. (United States)
          </li>
        </ul>
        <p>
          Some of these providers store or process information in the United
          States and other countries outside Japan. Information about each
          country&rsquo;s personal information protection system is published
          by the Personal Information Protection Commission of Japan. We select
          providers that maintain appropriate security measures and handle
          personal information only for the services they provide to us.
        </p>
      </>
    ),
  },
  {
    title: "5. Disclosure to Third Parties",
    body: (
      <p>
        We do not sell your personal information, and we do not provide it to
        third parties without your consent, except where permitted by law — for
        example, when required by law, when necessary to protect a person&rsquo;s
        life, body, or property, or when entrusting handling to service
        providers as described above.
      </p>
    ),
  },
  {
    title: "6. Retention",
    body: (
      <p>
        We keep inquiry information for as long as needed to respond to you and
        manage any resulting business relationship, and then delete it within a
        reasonable period unless we are required to keep it longer by law.
      </p>
    ),
  },
  {
    title: "7. Security",
    body: (
      <p>
        We take reasonable organizational, personnel, physical, and technical
        measures to protect personal information, including encrypted (HTTPS)
        connections, limiting access to people who need it, and using service
        providers with appropriate security controls.
      </p>
    ),
  },
  {
    title: "8. Your Rights",
    body: (
      <p>
        You may ask us to disclose, correct, add to, delete, or stop using the
        personal information we hold about you, or to stop providing it to third
        parties, as provided by Japan&rsquo;s Act on the Protection of Personal
        Information. Please send your request through our{" "}
        <Link href="/contact" className="text-forest underline underline-offset-4 hover:text-ochre-dark">
          contact form
        </Link>
        . We will confirm your identity before responding and reply within a
        reasonable period.
      </p>
    ),
  },
  {
    title: "9. External Links",
    body: (
      <p>
        This site links to external services, such as Calendly for booking
        meetings and Google Maps for our location. Their own privacy policies
        apply when you use them.
      </p>
    ),
  },
  {
    title: "10. Changes to This Policy",
    body: (
      <p>
        We may update this policy from time to time. The latest version will
        always be available on this page with its effective date.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description={`${siteConfig.name} respects your privacy and handles personal information in accordance with Japan's Act on the Protection of Personal Information (APPI).`}
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-ink-muted">Effective: {EFFECTIVE_DATE}</p>
            <div className="mt-10 space-y-12">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                  <div className="mt-4 space-y-4 leading-relaxed text-ink-light">
                    {section.body}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-16 border-t border-forest-100 pt-8 text-ink-light">
              Questions about this policy?{" "}
              <Link href="/contact" className="font-semibold text-forest hover:text-ochre-dark">
                Contact us
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
