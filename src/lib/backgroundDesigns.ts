// Pure-CSS background patterns a user can apply to their whole presentation
// from the editor's Design tab. No images needed — each is a repeating
// gradient, so it works at any slide size and costs nothing to export/embed.

export type BackgroundDesignKey =
  | "none"
  | "dots"
  | "grid"
  | "diagonal"
  | "circles"
  | "waves";

export const BACKGROUND_DESIGNS: Record<
  BackgroundDesignKey,
  { label: string; css: string; size?: string }
> = {
  none: { label: "None", css: "" },
  dots: {
    label: "Dots",
    css: "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
    size: "16px 16px",
  },
  grid: {
    label: "Grid",
    css: "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
    size: "24px 24px",
  },
  diagonal: {
    label: "Lines",
    css: "repeating-linear-gradient(45deg, rgba(0,0,0,0.04), rgba(0,0,0,0.04) 1px, transparent 1px, transparent 10px)",
  },
  circles: {
    label: "Circles",
    css: "radial-gradient(circle at 80% 20%, rgba(0,0,0,0.06) 0%, transparent 50%)",
  },
  waves: {
    label: "Noise",
    css: "repeating-linear-gradient(60deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 2px, transparent 2px, transparent 12px)",
  },
};

export const BACKGROUND_DESIGN_KEYS = Object.keys(
  BACKGROUND_DESIGNS,
) as BackgroundDesignKey[];

export function isBackgroundDesignKey(v: string): v is BackgroundDesignKey {
  return (BACKGROUND_DESIGN_KEYS as string[]).includes(v);
}
