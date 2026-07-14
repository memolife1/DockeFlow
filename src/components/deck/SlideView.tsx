import type { Presentation, Slide, TemplateTheme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildThemeSpec } from "@/lib/layouts/theme";
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
}: {
  slide: Slide;
  theme: TemplateTheme;
  themeOverrides?: Presentation["themeOverrides"];
  index?: number;
  total?: number;
  className?: string;
  logoWatermark?: Presentation["logoWatermark"];
  logoDataUri?: string;
}) {
  const spec = buildThemeSpec(theme, themeOverrides);
  const resolved = resolveSlide(slide, {
    index: index ?? slide.orderIndex ?? 0,
    total: total ?? 1,
    deckTitle: "",
    spec,
  });
  const design = spec.backgroundDesign ? BACKGROUND_DESIGNS[spec.backgroundDesign] : undefined;

  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden [container-type:inline-size]",
        className,
      )}
      style={{
        background: `#${spec.colors[resolved.background]}`,
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
            style={{ pointerEvents: "none" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `#${spec.colors[resolved.background]}`,
              opacity: 0.15,
              pointerEvents: "none",
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
    return (
      <div
        style={{
          ...base,
          display: "flex",
          flexDirection: "column",
          justifyContent: justify,
          textAlign,
          direction: isArabic ? "rtl" : undefined,
          color: `#${spec.colors[el.color]}`,
          fontSize: `${el.size * PT}cqw`,
          fontWeight: el.bold ? 700 : 400,
          fontStyle: el.italic ? "italic" : undefined,
          fontFamily: el.font === "head" ? spec.fontHeadCss : spec.fontBodyCss,
          lineHeight: el.lineSpacing ?? 1.15,
          letterSpacing: el.charSpacing
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
            WebkitLineClamp: el.maxLines ?? 99,
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
