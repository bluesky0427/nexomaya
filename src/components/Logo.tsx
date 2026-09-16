import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * Brand lockup. The logo mark and the brush wordmark are separate cut-outs so
 * the "Technology Group" line can sit directly beneath the wordmark rather
 * than beside the whole lockup.
 *
 * The artwork ships in two tints: olive ink for light grounds, and cream for
 * dark ones (`light`). Both are transparent PNGs rather than SVG — the brush
 * strokes carry a dry-brush texture that vector tracing would flatten.
 */
export default function Logo({
  light = false,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  const suffix = light ? "-light" : "";
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 transition-opacity hover:opacity-85",
        className
      )}
      aria-label={`${siteConfig.name} — home`}
    >
      <Image
        src={`/logo-mark${suffix}.png`}
        alt=""
        width={409}
        height={406}
        priority
        className="h-10 w-auto"
      />
      <span className="flex flex-col">
        <Image
          src={`/logo-wordmark${suffix}.png`}
          alt=""
          width={900}
          height={314}
          priority
          className="h-[30px] w-auto"
        />
        <span
          className={cn(
            "mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em]",
            light ? "text-forest-100" : "text-ink-muted"
          )}
        >
          Technology Group
        </span>
      </span>
    </Link>
  );
}
