import type { Presentation, Slide, TemplateTheme } from "../types";
import { isBackgroundDesignKey } from "../backgroundDesigns";
import type { ColorRole, ThemeSpec } from "./types";

type ThemeOverrides = Presentation["themeOverrides"];

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

export function buildThemeSpec(t: TemplateTheme, overrides?: ThemeOverrides): ThemeSpec {
  const brand = t.brand;
  const primary = normHex(overrides?.accent ?? brand?.roles?.primary ?? t.accent, "2563EB");

  // Dark: near-black with a slight cast of the primary. If the brand supplies
  // one, verify it is actually dark enough to hold white text.
  let dark = normHex(brand?.roles?.dark, mix(primary, NEAR_BLACK, 0.86));
  if (contrast(WHITE, dark) < 4.5) dark = mix(primary, NEAR_BLACK, 0.9);
  if (contrast(WHITE, dark) < 4.5) dark = NEAR_BLACK;

  if (process.env.NODE_ENV === "development") {
    console.log("[buildThemeSpec]", { hasBrand: !!brand, primary, dark });
  }

  // Accent defaults to a deeper cut of the primary (keeps palettes cohesive);
  // brands may supply a genuine second color, and the Design tab's single
  // accent control sets both primary and accent to the same hex.
  let accent = normHex(overrides?.accent ?? brand?.roles?.accent, mix(primary, NEAR_BLACK, 0.3));
  // Accent is used for large text on light surfaces — keep it readable.
  if (contrast(accent, WHITE) < 3) accent = mix(accent, NEAR_BLACK, 0.4);

  let effPrimary = primary;
  // Primary is used for big stat values / numerals on light surfaces.
  if (contrast(effPrimary, WHITE) < 2.2)
    effPrimary = mix(effPrimary, NEAR_BLACK, 0.35);

  const surface = normHex(overrides?.surface ?? brand?.roles?.surface, WHITE);
  const textBody = normHex(overrides?.ink, "2B3038");
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
    textBody,
    textMuted: "666D7A",
    white: WHITE,
  };

  // A Design-tab font choice is a deliberate full override — it wins over
  // whatever the brand extracted, unlike the color roles above which layer.
  // Heading and body fonts are independently overridable.
  const effectiveFontFamily = overrides?.fontFamily ?? t.fontFamily;
  const serif = effectiveFontFamily === "serif";
  const fontHead = overrides?.fontFamily
    ? serif
      ? "Georgia"
      : "Plus Jakarta Sans"
    : brand?.fontHead || (serif ? "Georgia" : "Plus Jakarta Sans");

  const bodySerif = overrides?.bodyFontFamily === "serif";
  const fontBody = overrides?.bodyFontFamily
    ? bodySerif
      ? "Georgia"
      : "Plus Jakarta Sans"
    : brand?.fontBody || "Plus Jakarta Sans";

  return {
    colors,
    fontHead,
    fontBody,
    fontHeadCss: serif
      ? '"Iowan Old Style", Palatino, Georgia, serif'
      : `"${fontHead}", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`,
    fontBodyCss: bodySerif
      ? '"Iowan Old Style", Palatino, Georgia, serif'
      : `"${fontBody}", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`,
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
    backgroundDesign:
      overrides?.backgroundDesign && isBackgroundDesignKey(overrides.backgroundDesign) && overrides.backgroundDesign !== "none"
        ? overrides.backgroundDesign
        : undefined,
    backgroundImageUri: overrides?.backgroundImageUri,
    decorationStyle: overrides?.decorationStyle,
  };
}

// Applies a slide's per-slide design overrides on top of a resolved
// ThemeSpec. Independent of themeOverrides — this is the "This slide" scope
// in the Inspector's Design tab, layered on top of "All slides". Shared by
// the HTML preview (SlideView) and the PPTX export so both stay in sync.
export function applySlideDesign(spec: ThemeSpec, sd: Slide["slideDesign"]): ThemeSpec {
  if (!sd) return spec;
  const next: ThemeSpec = { ...spec, colors: { ...spec.colors } };

  if (sd.backgroundColor) next.colors.surface = normHex(sd.backgroundColor, next.colors.surface);
  if (sd.headlineColor) next.headlineOverride = normHex(sd.headlineColor, "");
  if (sd.bodyColor) next.bodyOverride = normHex(sd.bodyColor, "");
  if (sd.accentColor) {
    const a = normHex(sd.accentColor, next.colors.primary);
    next.colors.primary = a;
    next.colors.accent = a;
  }
  if (
    sd.backgroundDesign &&
    isBackgroundDesignKey(sd.backgroundDesign) &&
    sd.backgroundDesign !== "none"
  ) {
    next.backgroundDesign = sd.backgroundDesign;
  }
  if (sd.backgroundImageUri) next.backgroundImageUri = sd.backgroundImageUri;
  if (sd.headingFont) {
    next.fontHead = sd.headingFont === "serif" ? "Georgia" : "Plus Jakarta Sans";
    next.fontHeadCss =
      sd.headingFont === "serif"
        ? '"Iowan Old Style", Palatino, Georgia, serif'
        : `"${next.fontHead}", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
  }
  if (sd.bodyFont) {
    next.fontBody = sd.bodyFont === "serif" ? "Georgia" : "Plus Jakarta Sans";
    next.fontBodyCss =
      sd.bodyFont === "serif"
        ? '"Iowan Old Style", Palatino, Georgia, serif'
        : `"${next.fontBody}", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
  }
  if (sd.decorationStyle) next.decorationStyle = sd.decorationStyle;
  return next;
}
