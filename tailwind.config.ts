import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // App design system. Cool neutral surfaces + the #0052ff primary.
        // Every app screen (dashboard, settings, templates, wizard, editor,
        // auth) styles through these tokens — the homepage uses a separate
        // set (primary/surface/on-surface) and is unaffected.
        ink: {
          DEFAULT: "#1a1b21", // primary text
          soft: "#44474e", // secondary / muted text
          muted: "#6a6e79",
          faint: "#a5a9b4",
        },
        paper: {
          DEFAULT: "#ffffff", // cards / sidebar (lowest surface)
          soft: "#faf8ff", // main background
          sunk: "#f2f3ff", // layered container (low)
        },
        line: {
          DEFAULT: "#e4e6f5",
          strong: "#c4c6cf",
        },
        accent: {
          DEFAULT: "#0052ff",
          hover: "#0041cc",
          soft: "#e8eaff", // prominent tint (active states, badges)
          ring: "#aab8ff",
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
      // Soft, primary-tinted shadows for a lifted, premium feel.
      boxShadow: {
        card: "0 1px 2px rgba(0,82,255,0.04), 0 4px 12px -6px rgba(0,82,255,0.10)",
        raised: "0 8px 24px -12px rgba(0,82,255,0.18), 0 2px 6px -3px rgba(0,82,255,0.10)",
        pop: "0 20px 40px -15px rgba(0,82,255,0.22)",
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
