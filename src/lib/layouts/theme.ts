import type { TemplateTheme } from "../types";
import type { ColorRole, ThemeSpec } from "./types";

// ---------------------------------------------------------------------------
// Theme derivation: TemplateTheme (accent + ink + font family, plus optional
// brand overrides from an uploaded .pptx) -> full role map with guaranteed
// text/background contrast. All hex values normalized to 6 digits, no "#".
// ---------------------------------------------------------------------------

export function normHex(input: string | undefined, fallback: string): string {
  if (!input) return fallback;
  let h = input.replace("#", "").trim().toUpperCase();
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  if (h.length === 8) h = h.slice(0, 6); // never 8-digit
  return /^[0-9A-F]{6}$/.test(h) ? h : fallback;
}

function toRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return (c(r) + c(g) + c(b)).toUpperCase();
}

// mix a into b by t (t=0 -> a, t=1 -> b)
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

export function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const WHITE = "FFFFFF";
const NEAR_BLACK = "10151E";

export function buildThemeSpec(t: TemplateTheme): ThemeSpec {
  const brand = t.brand;
  const primary = normHex(brand?.roles?.primary ?? t.accent, "2563EB");

  // Dark: near-black with a slight cast of the primary. If the brand supplies
  // one, verify it is actually dark enough to hold white text.
  let dark = normHex(brand?.roles?.dark, mix(primary, NEAR_BLACK, 0.86));
  if (contrast(WHITE, dark) < 4.5) dark = mix(primary, NEAR_BLACK, 0.9);
  if (contrast(WHITE, dark) < 4.5) dark = NEAR_BLACK;

  // Accent defaults to a deeper cut of the primary (keeps palettes cohesive);
  // brands may supply a genuine second color.
  let accent = normHex(brand?.roles?.accent, mix(primary, NEAR_BLACK, 0.3));
  // Accent is used for large text on light surfaces — keep it readable.
  if (contrast(accent, WHITE) < 3) accent = mix(accent, NEAR_BLACK, 0.4);

  let effPrimary = primary;
  // Primary is used for big stat values / numerals on light surfaces.
  if (contrast(effPrimary, WHITE) < 2.2)
    effPrimary = mix(effPrimary, NEAR_BLACK, 0.35);

  const surface = normHex(brand?.roles?.surface, WHITE);
  const colors: Record<ColorRole, string> = {
    primary: effPrimary,
    primaryTint: mix(effPrimary, WHITE, 0.9),
    primaryShade: mix(effPrimary, NEAR_BLACK, 0.32),
    dark,
    surface,
    surfaceAlt: mix(effPrimary, WHITE, 0.945),
    neutralTint: "F2F4F8",
    accent,
    accentTint: mix(accent, WHITE, 0.9),
    textOnDark: WHITE,
    textOnDarkMuted: mix(dark, WHITE, 0.62),
    textBody: "2B3038",
    textMuted: "666D7A",
    white: WHITE,
  };

  const serif = t.fontFamily === "serif";
  const fontHead = brand?.fontHead || (serif ? "Georgia" : "Plus Jakarta Sans");
  const fontBody = brand?.fontBody || "Plus Jakarta Sans";

  return {
    colors,
    fontHead,
    fontBody,
    fontHeadCss: serif
      ? '"Iowan Old Style", Palatino, Georgia, serif'
      : `"${fontHead}", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`,
    fontBodyCss: `"${fontBody}", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`,
    chartPalette: [
      effPrimary,
      colors.primaryShade,
      mix(effPrimary, WHITE, 0.45),
      dark,
      "94A3B8",
      accent,
    ],
    logoDataUri: brand?.logoDataUri,
    brandName: brand?.name,
  };
}
