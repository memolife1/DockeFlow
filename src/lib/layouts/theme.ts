import type { Presentation, Slide, TemplateTheme } from "../types";
import { isBackgroundDesignKey } from "../backgroundDesigns";
import { getFontById } from "../fonts";
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

// Deterministic 0..1 float from a string — same inputs always agree, but
// different templates land at different points in the range.
function seedFraction(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

// The richest color in a CSS gradient string — used as the solid fallback
// wherever a flat hex is required (PPTX slide backgrounds can't render CSS
// gradients, so this becomes the deck's actual "surface" role color; the
// HTML preview then paints the real gradient as a cosmetic layer on top of
// slides using that role).
function dominantGradientColor(gradient: string): string | undefined {
  const matches = gradient.match(/#([0-9A-Fa-f]{6})/g);
  if (!matches || matches.length === 0) return undefined;
  return matches[matches.length - 1].replace("#", "").toUpperCase();
}

// A template's own literal "circles" decoration name maps onto the layout
// system's existing "bubbles" variant (same ellipse treatment) so the
// Inspector's Design tab picker — which only knows bubbles/geometric/
// lines/corners/minimal/none — stays the single vocabulary for decoration.
function templateDecorationToSpec(
  d: TemplateTheme["decorationStyle"],
): string | undefined {
  if (!d) return undefined;
  return d === "circles" ? "bubbles" : d;
}

export function buildThemeSpec(t: TemplateTheme, overrides?: ThemeOverrides): ThemeSpec {
  const brand = t.brand;
  const primary = normHex(overrides?.accent ?? brand?.roles?.primary ?? t.accent, "2563EB");

  // Dark: near-black with a slight cast of the primary. If the brand supplies
  // one, verify it is actually dark enough to hold white text.
  let dark = normHex(brand?.roles?.dark, mix(primary, NEAR_BLACK, 0.86));
  if (contrast(WHITE, dark) < 4.5) dark = mix(primary, NEAR_BLACK, 0.9);
  if (contrast(WHITE, dark) < 4.5) dark = NEAR_BLACK;

  // Subtle per-template variation on the dark background so two templates
  // that would otherwise compute a near-identical near-black don't render
  // as literally the same deck. Seeded on the template's own identity
  // (brand name, or its editorial "character" label for built-ins) — kept
  // small enough to never risk the white-text contrast check above.
  if (!overrides?.backgroundImageUri) {
    const seed = seedFraction(brand?.name || t.character || primary);
    const darkAfterTint =
      seed < 0.34
        ? dark // standard — no change, most common case
        : seed < 0.67
        ? mix(dark, primary, 0.08) // rich-dark — a touch more of the brand hue
        : mix(dark, WHITE, 0.05); // soft-dark — slightly lifted
    if (contrast(WHITE, darkAfterTint) >= 4.5) dark = darkAfterTint;
  }

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

  // Surface/ink previously fell straight through to a hardcoded WHITE/
  // "2B3038" whenever there was no Design-tab override or brand extraction —
  // silently discarding every built-in template's own declared surface/ink
  // (e.g. "Editorial"'s warm cream FAF7F2 + near-black 1C1917), so every
  // template rendered with the exact same white background and body-text
  // color regardless of its actual theme. This is also why the Inspector's
  // color swatches (which read theme.surface/theme.ink directly) looked
  // "wrong" — they showed the template's real declared color while the
  // renderer was quietly ignoring it. t.surface/t.ink now sit in the same
  // override > brand > template > hardcoded-fallback chain as every other
  // role above.
  let surface = normHex(overrides?.surface ?? brand?.roles?.surface ?? t.surface, WHITE);
  let surfaceAlt = mix(effPrimary, WHITE, 0.945);
  let neutralTint = "F2F4F8";
  let textBody = normHex(overrides?.ink ?? t.ink, "2B3038");
  let textMuted = "666D7A";

  // Gradient-background templates ("Midnight Navy", "Cobalt Pro", etc.) put
  // every ordinary content slide on the deck's signature dark/vivid canvas
  // instead of the usual white — so the "surface" role and everything read
  // against it (body text, muted text, card tints) need to be recomputed for
  // that background exactly like the "dark" role already is above. Skipped
  // when the user has picked their own surface color (Design tab) or a
  // background photo — those are deliberate overrides of the template.
  const usingTemplateGradient =
    !overrides?.surface &&
    !overrides?.backgroundImageUri &&
    (t.backgroundStyle === "gradient" ||
      t.backgroundStyle === "dark-gradient" ||
      t.backgroundStyle === "mesh") &&
    !!t.backgroundGradient;
  if (usingTemplateGradient) {
    const dominant = dominantGradientColor(t.backgroundGradient!) ?? dark;
    if (contrast(WHITE, dominant) >= 4.5) {
      surface = dominant;
      surfaceAlt = mix(dominant, WHITE, 0.14);
      neutralTint = mix(dominant, WHITE, 0.1);
      textBody = WHITE;
      textMuted = mix(dominant, WHITE, 0.62);
    }
  }

  // Keep primary/accent legible against whatever the deck's actual light
  // surface ends up being — usually WHITE, but a gradient-background
  // template (or a brand extraction) can land on a much darker one, and a
  // template's accent can even equal its own gradient's dominant color.
  if (contrast(effPrimary, surface) < 2.4) {
    effPrimary =
      contrast(WHITE, surface) >= contrast(NEAR_BLACK, surface)
        ? mix(effPrimary, WHITE, 0.55)
        : mix(effPrimary, NEAR_BLACK, 0.4);
  }
  if (contrast(accent, surface) < 2.4) {
    accent =
      contrast(WHITE, surface) >= contrast(NEAR_BLACK, surface)
        ? mix(accent, WHITE, 0.55)
        : mix(accent, NEAR_BLACK, 0.4);
  }

  const colors: Record<ColorRole, string> = {
    primary: effPrimary,
    primaryTint: mix(effPrimary, WHITE, 0.9),
    primaryShade: mix(effPrimary, NEAR_BLACK, 0.32),
    dark,
    surface,
    surfaceAlt,
    neutralTint,
    accent,
    accentTint: mix(accent, WHITE, 0.9),
    textOnDark: WHITE,
    textOnDarkMuted: mix(dark, WHITE, 0.62),
    textBody,
    textMuted,
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

  let fontHeadCss = serif
    ? '"Iowan Old Style", Palatino, Georgia, serif'
    : `"${fontHead}", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
  let fontBodyCss = bodySerif
    ? '"Iowan Old Style", Palatino, Georgia, serif'
    : `"${fontBody}", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
  let resolvedFontHead = fontHead;
  let resolvedFontBody = fontBody;

  // A specific Google Font (Design tab's font picker) is the most deliberate
  // override of all — it wins over both the brand's extracted font and the
  // plain sans/serif toggle above.
  const headingFont = getFontById(overrides?.headingFontId);
  if (headingFont) {
    resolvedFontHead = headingFont.pptxName;
    fontHeadCss = headingFont.cssStack;
  }
  const bodyFont = getFontById(overrides?.bodyFontId);
  if (bodyFont) {
    resolvedFontBody = bodyFont.pptxName;
    fontBodyCss = bodyFont.cssStack;
  }

  return {
    colors,
    fontHead: resolvedFontHead,
    fontBody: resolvedFontBody,
    fontHeadCss,
    fontBodyCss,
    headingFontId: overrides?.headingFontId,
    bodyFontId: overrides?.bodyFontId,
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
    decorationStyle: overrides?.decorationStyle ?? templateDecorationToSpec(t.decorationStyle),
    backgroundStyle: t.backgroundStyle,
    backgroundGradient: usingTemplateGradient ? t.backgroundGradient : undefined,
    headlineWeight: t.headlineWeight,
    headlineLetterSpacing: t.headlineLetterSpacing,
    headlineSizeMultiplier: t.headlineSizeMultiplier,
    decorationOpacity: t.decorationOpacity,
    cardStyle: t.cardStyle,
    accentLineWeight: t.accentLineWeight,
  };
}

// Applies a slide's per-slide design overrides on top of a resolved
// ThemeSpec. Independent of themeOverrides — this is the "This slide" scope
// in the Inspector's Design tab, layered on top of "All slides". Shared by
// the HTML preview (SlideView) and the PPTX export so both stay in sync.
export function applySlideDesign(spec: ThemeSpec, sd: Slide["slideDesign"]): ThemeSpec {
  if (!sd) return spec;
  const next: ThemeSpec = { ...spec, colors: { ...spec.colors } };

  if (sd.backgroundColor) {
    next.colors.surface = normHex(sd.backgroundColor, next.colors.surface);
    // An explicit per-slide color is a deliberate override — stop painting
    // the template's gradient behind it.
    next.backgroundGradient = undefined;
  }
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
    next.headingFontId = undefined;
  }
  if (sd.bodyFont) {
    next.fontBody = sd.bodyFont === "serif" ? "Georgia" : "Plus Jakarta Sans";
    next.fontBodyCss =
      sd.bodyFont === "serif"
        ? '"Iowan Old Style", Palatino, Georgia, serif'
        : `"${next.fontBody}", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
    next.bodyFontId = undefined;
  }
  // A per-slide Google Font choice is the most deliberate override of all —
  // it wins over everything above, including a per-slide sans/serif toggle.
  const headingFont = getFontById(sd.headingFontId);
  if (headingFont) {
    next.fontHead = headingFont.pptxName;
    next.fontHeadCss = headingFont.cssStack;
    next.headingFontId = sd.headingFontId;
  }
  const bodyFont = getFontById(sd.bodyFontId);
  if (bodyFont) {
    next.fontBody = bodyFont.pptxName;
    next.fontBodyCss = bodyFont.cssStack;
    next.bodyFontId = sd.bodyFontId;
  }
  if (sd.decorationStyle) next.decorationStyle = sd.decorationStyle;
  return next;
}
