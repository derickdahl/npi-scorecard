import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sonance Brand Colors
        sonance: {
          charcoal: "#343d46",
          silver: "#e2e2e2",
          beam: "#00A3E1",      // The Beam (accent blue)
          white: "#FFFFFF",
          black: "#000000",
        },
        // Gray scale
        gray: {
          50: "#f8f9f9",
          100: "#f0f1f2",
          500: "#7a8389",
          900: "#343d46",
        },
        // Semantic aliases
        primary: "#343d46",
        accent: "#00A3E1",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
