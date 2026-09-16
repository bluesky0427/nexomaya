import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

/**
 * Share preview image (1200×630) used by LinkedIn, X, Slack, etc. Generated at
 * build time and applied to every page.
 */

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

/** Reads a public/ asset and inlines it, since ImageResponse cannot fetch relative URLs. */
async function loadAsset(file: string): Promise<string> {
  const data = await readFile(path.join(process.cwd(), "public", file));
  return `data:image/png;base64,${data.toString("base64")}`;
}

export default async function OpengraphImage() {
  // The wordmark is artwork now, so only the supporting text needs a webfont.
  const [inter, logo] = await Promise.all([
    loadGoogleFont("Inter", 500, `${EYEBROW}${siteConfig.tagline}${SITE_HOST}`),
    loadAsset("logo-light.png"),
  ]);

  const fonts = [
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
          backgroundColor: "#2B331A",
          fontFamily: inter ? "Inter" : undefined,
          backgroundImage:
            "radial-gradient(circle at 92% 8%, rgba(184,137,58,0.30) 0%, rgba(43,51,26,0) 45%), radial-gradient(circle at 0% 100%, rgba(113,129,76,0.55) 0%, rgba(43,51,26,0) 50%)",
          color: "#F9F5EE",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 5,
            color: "#D8B871",
          }}
        >
          {EYEBROW}
        </div>

        {/* Logo lockup + tagline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" width={760} height={210} />
          <div
            style={{
              display: "flex",
              width: 96,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#B8893A",
              marginTop: 28,
            }}
          />
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 34,
              color: "#E6EBD8",
            }}
          >
            {siteConfig.tagline}
          </div>
        </div>

        {/* Footer line */}
        <div style={{ display: "flex", fontSize: 26, color: "#CCD5B4" }}>
          {SITE_HOST}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined }
  );
}
