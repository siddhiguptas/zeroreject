import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        archival: {
          bg: "#F6F4EE",
          paper: "#FFFFFF",
          border: "#DFDBD2",
          hairline: "#EAE7DF",
          obsidian: "#111625",
          slate: "#525866",
          navy: "#162A45",
          vermilion: "#C93B2B",
          ochre: "#B86B11",
          emerald: "#0E6F53",
        },
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Menlo", "monospace"],
      },
      boxShadow: {
        archival: "0 1px 3px rgba(17, 22, 37, 0.05), 0 4px 12px rgba(17, 22, 37, 0.03)",
        elevated: "0 4px 20px rgba(17, 22, 37, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
