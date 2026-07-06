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

        // ---- Marketing landing (Stitch) palette. Additive; used only by the
        // homepage. None of these names collide with the app's tokens above.
        primary: "#0052ff",
        "on-primary": "#ffffff",
        surface: {
          DEFAULT: "#faf8ff",
          dim: "#d2d9f4",
          bright: "#faf8ff",
        },
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f3ff",
        "surface-container": "#eef0ff",
        "surface-container-high": "#e8eaff",
        "surface-container-highest": "#e2e5ff",
        "on-surface": "#1a1b21",
        "on-surface-variant": "#44474e",
        outline: {
          DEFAULT: "#74777f",
          variant: "#c4c6cf",
        },
        secondary: "#595d71",
        "on-secondary": "#ffffff",
        "secondary-container": "#dee1f9",
        "on-secondary-container": "#161b2c",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        // Marketing landing display/body font.
        jakarta: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      // Named spacing tokens used by the Stitch landing markup. Additive — the
      // app uses numeric spacing, so these only add new utilities.
      spacing: {
        base: "4px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        gutter: "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
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
