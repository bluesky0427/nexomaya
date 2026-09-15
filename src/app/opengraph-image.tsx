import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

/**
 * Share preview image (1200×630) used by LinkedIn, X, Slack, etc. Generated at
 * build time and applied to every page.
 */

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TITLE = siteConfig.name;
const EYEBROW = "TECHNOLOGY · HUMAN SKILL · OPPORTUNITY";
const SITE_HOST = siteConfig.url.replace(/^https?:\/\//, "");

/**
 * Loads a font subset (just the characters in `text`) from Google Fonts — the
 * same fonts the site uses. Returns null if the download fails, in which case
 * the image falls back to the built-in font rather than breaking the build.
 */
async function loadGoogleFont(
  family: string,
  weight: number,
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [playfair, inter] = await Promise.all([
    loadGoogleFont("Playfair Display", 700, `${TITLE}NX`),
    loadGoogleFont("Inter", 500, `${EYEBROW}${siteConfig.tagline}${SITE_HOST}`),
  ]);
  const serif = playfair ? "Playfair Display" : undefined;

  const fonts = [
    playfair && { name: "Playfair Display", data: playfair, weight: 700 as const },
    inter && { name: "Inter", data: inter, weight: 500 as const },
  ].filter((font) => font !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#071A33",
          fontFamily: inter ? "Inter" : undefined,
          backgroundImage:
            "radial-gradient(circle at 92% 8%, rgba(200,160,77,0.28) 0%, rgba(7,26,51,0) 45%), radial-gradient(circle at 0% 100%, rgba(31,74,130,0.55) 0%, rgba(7,26,51,0) 50%)",
          color: "#ffffff",
        }}
      >
        {/* Monogram + eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: 18,
              backgroundColor: "#0B2545",
              border: "2px solid rgba(255,255,255,0.15)",
              fontFamily: serif,
              fontSize: 46,
              fontWeight: 700,
            }}
          >
            <span style={{ color: "#ffffff" }}>N</span>
            <span style={{ color: "#C8A04D" }}>X</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 5,
              color: "#DDBE7E",
            }}
          >
            {EYEBROW}
          </div>
        </div>

        {/* Name + tagline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: serif,
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            {TITLE}
          </div>
          <div
            style={{
              display: "flex",
              width: 96,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#C8A04D",
              marginTop: 32,
            }}
          />
          <div
            style={{
              display: "flex",
              marginTop: 32,
              fontSize: 36,
              color: "#DDBE7E",
            }}
          >
            {siteConfig.tagline}
          </div>
        </div>

        {/* Footer line */}
        <div style={{ display: "flex", fontSize: 26, color: "#CBD9EB" }}>
          {SITE_HOST}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined }
  );
}
