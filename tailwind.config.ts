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
        // DSFR-inspired governmental blue palette
        dsfr: {
          blue: "#003189",
          "blue-hover": "#1212ff",
          "blue-light": "#e8edff",
          red: "#e1000f",
          grey: "#6a6a6a",
          "grey-light": "#f6f6f6",
          "grey-border": "#dddddd",
        },
      },
      fontFamily: {
        sans: ["Marianne", "system-ui", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
