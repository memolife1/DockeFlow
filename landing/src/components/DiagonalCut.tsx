import type { CSSProperties } from "react";

/**
 * The page's single visual signature: a skewed clip-path shape rendered in a
 * fill color with a 2px edge line offset behind it. Cobalt fill + Coral edge
 * by default. Parameterized so it can appear as the hero split divider, a
 * section transition, or a small corner accent — and nowhere else.
 */
export function DiagonalCut({
  angle = 13,
  color = "#2B4EFF",
  edge = "#FF6B5E",
  className = "",
  style,
}: {
  angle?: number;
  color?: string;
  edge?: string;
  className?: string;
  style?: CSSProperties;
}) {
  // A parallelogram-style band; `angle` controls how steep the skew reads.
  const top = angle;
  const bottom = 100 - angle;
  const clip = `polygon(0 0, 100% ${top}%, 100% 100%, 0 ${bottom}%)`;

  return (
    <span
      aria-hidden
      className={className}
      style={{ position: "relative", display: "block", ...style }}
    >
      {/* Coral edge line sits behind, offset by 2px on the leading diagonal. */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: edge,
          clipPath: clip,
          transform: "translate(2px, -2px)",
        }}
      />
      {/* Cobalt (or override) fill in front. */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: color,
          clipPath: clip,
        }}
      />
    </span>
  );
}
