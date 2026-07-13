import type { ChartSpec } from "../types";
import type { BackgroundDesignKey } from "../backgroundDesigns";

// ---------------------------------------------------------------------------
// Single-source-of-truth layout system.
//
// Every slide layout resolves to a flat list of positioned elements on a
// 13.33 x 7.5 inch canvas (pptx LAYOUT_WIDE). Coordinates are ALWAYS inches;
// font sizes are ALWAYS points. Colors are ALWAYS role names — a ThemeSpec
// maps roles to hex at render time. Both renderers consume this exact data:
//   - lib/pptx.ts        -> pptxgenjs calls (inches/points used directly)
//   - components SlideView -> scaled HTML/CSS (inches -> %, points -> cqw)
// ---------------------------------------------------------------------------

export const CANVAS_W = 13.33;
export const CANVAS_H = 7.5;
export const MARGIN = 0.75;

export type ColorRole =
  | "primary"
  | "primaryTint"
  | "primaryShade"
  | "dark"
  | "surface"
  | "surfaceAlt"
  | "neutralTint"
  | "accent"
  | "accentTint"
  | "textOnDark"
  | "textOnDarkMuted"
  | "textBody"
  | "textMuted"
  | "white";

// Role -> hex (6-digit, NO "#", never 8-digit — pptxgenjs requirement).
export interface ThemeSpec {
  colors: Record<ColorRole, string>;
  fontHead: string; // pptx fontFace for headings
  fontBody: string;
  fontHeadCss: string; // CSS font-family stacks for the preview
  fontBodyCss: string;
  chartPalette: string[]; // hex list (no #)
  logoDataUri?: string; // brand logo (Phase 4)
  brandName?: string;
  // Per-presentation design overrides (editor Design tab).
  backgroundDesign?: BackgroundDesignKey;
  backgroundImageUri?: string;
}

interface BaseEl {
  x: number; // inches
  y: number;
  w: number;
  h: number;
}

export interface TextEl extends BaseEl {
  kind: "text";
  text: string;
  size: number; // points
  color: ColorRole;
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  valign?: "top" | "middle" | "bottom";
  font?: "head" | "body";
  lineSpacing?: number; // multiple, e.g. 1.15
  charSpacing?: number; // pt
  shrink?: boolean; // auto-shrink to fit box (pptx fit:'shrink')
  maxLines?: number; // preview-side clamp hint
}

export type ShapeKind = "rect" | "roundRect" | "ellipse" | "chevron" | "trapezoid";

export interface ShapeEl extends BaseEl {
  kind: "shape";
  shape: ShapeKind;
  fill: ColorRole;
  transparency?: number; // 0-100 (pptx), preview converts to alpha
  radius?: number; // inches; roundRect only
  shadow?: boolean;
  flipV?: boolean;
  line?: { color: ColorRole; width: number }; // pt
}

export interface IconEl extends BaseEl {
  kind: "icon";
  icon: string; // semantic name from the icon map
  color: ColorRole;
}

export interface ImageEl extends BaseEl {
  kind: "image";
  url?: string; // resolved image URL
  query?: string; // stock search intent (shown in placeholder)
  fallback: ColorRole; // solid fill when no image available
  overlay?: { color: ColorRole; transparency: number }; // legibility overlay
}

export interface ChartEl extends BaseEl {
  kind: "chart";
  chart: ChartSpec;
}

export type LayoutEl = TextEl | ShapeEl | IconEl | ImageEl | ChartEl;

export interface ResolvedSlide {
  background: ColorRole;
  elements: LayoutEl[];
}

export interface ResolveCtx {
  index: number;
  total: number;
  deckTitle: string;
  // The resolved theme, so layouts can render brand-specific elements (e.g. a
  // real uploaded logo) without re-deriving it. Optional so existing callers
  // that don't need it keep working.
  spec?: ThemeSpec;
}
