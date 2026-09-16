"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/cn";
import Container from "./Container";
import Logo from "./Logo";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Subtle shadow once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-200",
        scrolled
          ? "border-forest-100/60 bg-white/90 backdrop-blur-md shadow-sm"
          : "border-transparent bg-white"
      )}
    >
      <Container className="flex h-20 items-center justify-between">
        <Logo />

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-forest"
                  : "text-ink-light hover:text-forest"
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-ochre" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-700"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-forest transition-colors hover:bg-forest-50 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <span className="sr-only">Menu</span>
          <div className="relative h-4 w-6">
            <span
              className={cn(
                "absolute left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300",
                open ? "top-1.5 rotate-45" : "top-0"
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 h-0.5 w-6 rounded-full bg-current transition-all duration-300",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300",
                open ? "top-1.5 -rotate-45" : "top-3"
              )}
            />
          </div>
        </button>
      </Container>

      {/* Mobile navigation panel. `inert` while closed keeps its links out of
          the tab order and hidden from screen readers. */}
      <div
        id="mobile-menu"
        inert={!open}
        className={cn(
          "overflow-hidden border-t border-forest-100/60 bg-white transition-[max-height] duration-300 ease-in-out lg:hidden",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-4 py-3 text-base font-medium transition-colors",
                isActive(item.href)
                  ? "bg-forest-50 text-forest"
                  : "text-ink-light hover:bg-forest-50 hover:text-forest"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white"
          >
            Contact Us
          </Link>
        </Container>
      </div>
    </header>
  );
}
