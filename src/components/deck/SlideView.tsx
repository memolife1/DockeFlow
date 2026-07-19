"use client";

import { useMemo } from "react";
import type { Presentation, Slide, TemplateTheme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildThemeSpec, applySlideDesign } from "@/lib/layouts/theme";
import { resolveSlide } from "@/lib/layouts/specs";
import {
  CANVAS_H,
  CANVAS_W,
  type LayoutEl,
  type ThemeSpec,
} from "@/lib/layouts/types";
import { BACKGROUND_DESIGNS } from "@/lib/backgroundDesigns";
import { iconSvg } from "@/lib/icons";
import { MiniChart } from "./MiniChart";

// ---------------------------------------------------------------------------
// HTML preview renderer. Consumes the SAME resolved layout specs as the PPTX
// export (lib/layouts/specs.ts): inches -> container %, points -> cqw. Any
// layout change automatically applies to both outputs.
// ---------------------------------------------------------------------------

// 1pt on a 13.33in-wide slide, as a fraction of container width.
// (13.33in * 72pt/in = 959.76pt across the full width.)
const PT = 100 / (CANVAS_W * 72);

const px = (inches: number, axis: "x" | "y") =>
  `${(inches / (axis === "x" ? CANVAS_W : CANVAS_H)) * 100}%`;

const ARABIC_RE = /[؀-ۿ]/;

export function SlideView({
  slide,
  theme,
  themeOverrides,
  index,
  total,
  className,
  logoWatermark,
  logoDataUri,
  showDefaultBrandMark = true,
}: {
  slide: Slide;
  theme: TemplateTheme;
  themeOverrides?: Presentation["themeOverrides"];
  index?: number;
  total?: number;
  className?: string;
  logoWatermark?: Presentation["logoWatermark"];
  logoDataUri?: string;
  // Free-plan-only "DECKEFLOW" fallback brand mark. Defaults to true so
  // callers that don't pass plan data (previews, share links, local/demo
  // mode) preserve the app's original always-on behavior.
  showDefaultBrandMark?: boolean;
}) {
  const baseSpec = buildThemeSpec(theme, themeOverrides);
  const spec = useMemo(
    () => applySlideDesign(baseSpec, slide.slideDesign),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseSpec, slide.slideDesign],
  );
  const resolved = resolveSlide(slide, {
    index: index ?? slide.orderIndex ?? 0,
    total: total ?? 1,
    deckTitle: "",
    spec,
    showDefaultBrandMark,
  });
  const design = spec.backgroundDesign ? BACKGROUND_DESIGNS[spec.backgroundDesign] : undefined;
  // A gradient-DNA template ("Midnight Navy", "Cobalt Pro", ...) paints its
  // signature gradient behind every hero/content slide instead of the flat
  // role color pptx export falls back to — cosmetic-only, the underlying
  // colors[resolved.background] hex (already contrast-safe, see
  // buildThemeSpec) is what PPTX actually uses.
  const usesGradientBg =
    !!spec.backgroundGradient &&
    (resolved.background === "surface" || resolved.background === "dark");

  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden [container-type:inline-size]",
        className,
      )}
      style={{
        background: usesGradientBg
          ? spec.backgroundGradient
          : `#${spec.colors[resolved.background]}`,
        fontFamily: spec.fontBodyCss,
      }}
    >
      {spec.backgroundImageUri && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={spec.backgroundImageUri}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ pointerEvents: "none", zIndex: 0 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `#${spec.colors[resolved.background]}`,
              opacity: 0.15,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        </>
      )}
      {design && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: design.css,
            backgroundSize: design.size,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}
      {resolved.elements.map((el, i) => (
        <El key={i} el={el} spec={spec} />
      ))}
      {logoWatermark && logoDataUri && (
        <img
          src={logoDataUri}
          alt=""
          style={{
            position: "absolute",
            ...(logoWatermark.position.includes("top") ? { top: "4%" } : { bottom: "4%" }),
            ...(logoWatermark.position.includes("left") ? { left: "4%" } : { right: "4%" }),
            height: logoWatermark.size === "small" ? "6%" : "9%",
            maxWidth: "18%",
            width: "auto",
            objectFit: "contain",
            opacity: 0.82,
            zIndex: 20,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

function El({ el, spec }: { el: LayoutEl; spec: ThemeSpec }) {
  const base: React.CSSProperties = {
    position: "absolute",
    left: px(el.x, "x"),
    top: px(el.y, "y"),
    width: px(el.w, "x"),
    height: px(el.h, "y"),
    zIndex: 2,
  };

  if (el.kind === "shape") {
    const style: React.CSSProperties = {
      ...base,
      background: `#${spec.colors[el.fill]}`,
      opacity: el.transparency ? 1 - el.transparency / 100 : 1,
    };
    if (el.shape === "roundRect")
      style.borderRadius = `${((el.radius ?? 0.09) / CANVAS_W) * 100}cqw`;
    if (el.shape === "ellipse") style.borderRadius = "50%";
    if (el.shape === "chevron")
      style.clipPath =
        "polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%, 18% 50%)";
    if (el.shape === "trapezoid")
      // flipV -> wide top, narrow bottom (funnel stage)
      style.clipPath = el.flipV
        ? "polygon(0 0, 100% 0, 86% 100%, 14% 100%)"
        : "polygon(14% 0, 86% 0, 100% 100%, 0 100%)";
    if (el.shadow) style.boxShadow = "0 3px 9px rgba(26,34,51,0.20)";
    if (el.line)
      style.border = `${el.line.width}px solid #${spec.colors[el.line.color]}`;
    return <div style={style} />;
  }

  if (el.kind === "text") {
    const justify =
      el.valign === "middle"
        ? "center"
        : el.valign === "bottom"
        ? "flex-end"
        : "flex-start";
    // Arabic-generated decks read right-to-left; mirror alignment unless the
    // layout explicitly centered or right-aligned the text already.
    const isArabic = ARABIC_RE.test(el.text);
    const textAlign =
      isArabic && (!el.align || el.align === "left") ? "right" : el.align ?? "left";
    const resolvedColor =
      el.font === "head" && spec.headlineOverride
        ? spec.headlineOverride
        : el.color === "textBody" && spec.bodyOverride
        ? spec.bodyOverride
        : spec.colors[el.color];
    // How many lines actually fit el.h at this element's own font size/line
    // spacing — both already in the same inches/points units as el.h, so no
    // pixel measurement is needed. A template's headlineWeight/sizeMultiplier
    // DNA can inflate the rendered font size well past what a layout's
    // hardcoded maxLines was tuned for; clamping to whichever is smaller is
    // what keeps text from visually cutting off mid-line instead of wrapping
    // to a clean line boundary.
    const lineHeightIn = (el.size * (el.lineSpacing ?? 1.15)) / 72;
    const fitLines = Math.max(1, Math.floor(el.h / lineHeightIn));
    const lineClamp = el.maxLines ? Math.min(el.maxLines, fitLines) : fitLines;
    return (
      <div
        style={{
          ...base,
          display: "flex",
          flexDirection: "column",
          justifyContent: justify,
          textAlign,
          direction: isArabic ? "rtl" : undefined,
          color: `#${resolvedColor}`,
          fontSize: `${el.size * PT}cqw`,
          fontWeight: el.weight ?? (el.bold ? 700 : 400),
          fontStyle: el.italic ? "italic" : undefined,
          fontFamily: el.font === "head" ? spec.fontHeadCss : spec.fontBodyCss,
          lineHeight: el.lineSpacing ?? 1.15,
          letterSpacing:
            el.letterSpacing != null
              ? `${el.letterSpacing}em`
              : el.charSpacing
              ? `${el.charSpacing * PT}cqw`
              : undefined,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: lineClamp,
          }}
        >
          {el.text}
        </span>
      </div>
    );
  }

  if (el.kind === "icon") {
    const svg = iconSvg(el.icon, spec.colors[el.color], 48);
    if (!svg) {
      return (
        <div
          style={{
            ...base,
            background: `#${spec.colors[el.color]}`,
            borderRadius: "22%",
          }}
        />
      );
    }
    return (
      <div
        style={{ ...base, display: "flex" }}
        dangerouslySetInnerHTML={{
          __html: svg.replace(
            /<svg/,
            '<svg style="width:100%;height:100%;display:block"',
          ),
        }}
      />
    );
  }

  if (el.kind === "image") {
    if (el.url) {
      return (
        <div style={base}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={el.url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {el.overlay && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `#${spec.colors[el.overlay.color]}`,
                opacity: 1 - el.overlay.transparency / 100,
              }}
            />
          )}
        </div>
      );
    }
    return (
      <div
        style={{
          ...base,
          background: `#${spec.colors[el.fallback]}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {el.query && (
          <span
            style={{
              color: `#${spec.colors.textMuted}`,
              fontSize: `${10 * PT}cqw`,
              textAlign: "center",
              padding: "0 8%",
            }}
          >
            {el.query}
          </span>
        )}
      </div>
    );
  }

  if (el.kind === "chart") {
    return (
      <div style={base}>
        <MiniChart
          chart={el.chart}
          palette={spec.chartPalette}
          mutedHex={spec.colors.textMuted}
        />
      </div>
    );
  }

  return null;
}

// Scaled, non-interactive thumbnail wrapper.
export function SlideThumb({
  slide,
  theme,
  themeOverrides,
  className,
  logoWatermark,
  logoDataUri,
}: {
  slide: Slide;
  theme: TemplateTheme;
  themeOverrides?: Presentation["themeOverrides"];
  className?: string;
  logoWatermark?: Presentation["logoWatermark"];
  logoDataUri?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-line bg-white shadow-card",
        className,
      )}
    >
      <SlideView
        slide={slide}
        theme={theme}
        themeOverrides={themeOverrides}
        logoWatermark={logoWatermark}
        logoDataUri={logoDataUri}
      />
    </div>
  );
}
