import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand palette, built around the olive green of the
        // Nexomaya logo artwork (forest-800 is the exact logo ink).
        forest: {
          DEFAULT: "#3C4624",
          50: "#F5F7EF",
          100: "#E6EBD8",
          200: "#CCD5B4",
          300: "#AEBB8D",
          400: "#8E9E68",
          500: "#71814C",
          600: "#5A683A",
          700: "#49552D",
          800: "#3C4624",
          900: "#2B331A",
        },
        // Warm off-white taken from the logo's own ground.
        cream: {
          DEFAULT: "#F9F5EE",
          dark: "#F0EADF",
        },
        ink: {
          DEFAULT: "#1F2419",
          light: "#4B5340",
          muted: "#6A7261",
        },
        // Small accent — warm ochre, the complement to the olive.
        ochre: {
          DEFAULT: "#B8893A",
          light: "#D8B871",
          dark: "#8A6524",
        },
        // Reserved for success / confirmation states only, kept distinctly
        // cooler than the brand olive so it reads as feedback, not branding.
        sage: {
          DEFAULT: "#2F6B54",
          light: "#6BA294",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      maxWidth: {
        container: "1200px",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(43, 51, 26, 0.20)",
        card: "0 4px 24px -8px rgba(43, 51, 26, 0.16)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "fade-in": "fade-in 0.9s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
