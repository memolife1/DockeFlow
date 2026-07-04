import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm neutral base (stone) + a single restrained rust accent.
        ink: {
          DEFAULT: "#1c1917",
          soft: "#44403c",
          muted: "#78716c",
          faint: "#a8a29e",
        },
        paper: {
          DEFAULT: "#ffffff",
          soft: "#faf9f7",
          sunk: "#f5f4f1",
        },
        line: {
          DEFAULT: "#e7e5e4",
          strong: "#d6d3d1",
        },
        accent: {
          DEFAULT: "#c2410c",
          hover: "#9a3412",
          soft: "#fdf1ec",
          ring: "#f3c9b6",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,25,23,0.04), 0 1px 3px rgba(28,25,23,0.06)",
        raised:
          "0 1px 2px rgba(28,25,23,0.05), 0 4px 12px rgba(28,25,23,0.08)",
        pop: "0 8px 30px rgba(28,25,23,0.12)",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      maxWidth: {
        editorial: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
