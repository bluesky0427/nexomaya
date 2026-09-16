import Link from "next/link";
import { navItems, siteConfig } from "@/lib/site";
import Container from "./Container";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest-900 text-forest-100">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand block */}
          <div className="md:col-span-5">
            <Logo light />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-forest-100">
              Connecting technology, human skill, and opportunity to create new
              value.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ochre-light">
              Navigation
            </h3>
            <ul className="mt-5 space-y-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-forest-100 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ochre-light">
              Get in Touch
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <span className="text-forest-200">Website</span>
                <br />
                <a
                  href={siteConfig.url}
                  className="text-forest-100 transition-colors hover:text-white"
                >
                  {siteConfig.domain}
                </a>
              </li>
              <li>
                <span className="text-forest-200">Location</span>
                <br />
                <a
                  href={siteConfig.address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-100 transition-colors hover:text-white"
                >
                  {siteConfig.address.full}
                </a>
              </li>
              <li>
                <span className="text-forest-200">Book a meeting</span>
                <br />
                <a
                  href={siteConfig.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-100 transition-colors hover:text-white"
                >
                  Schedule online →
                </a>
              </li>
            </ul>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ochre px-5 py-2.5 text-sm font-semibold text-forest-900 transition-colors hover:bg-ochre-light"
            >
              Contact Us
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* Closing line */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="font-serif text-lg text-white">
            Together, we create new value.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-xs text-forest-200 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} Nexomaya Technology Group. All rights reserved.
              <span aria-hidden className="mx-2">·</span>
              <Link
                href="/privacy"
                className="transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
            </p>
            <p>
              Connecting Technology, Human Skill, and Opportunity.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
