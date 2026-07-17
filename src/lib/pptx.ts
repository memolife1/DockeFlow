import pptxgen from "pptxgenjs";
import type { Presentation, Slide, TemplateTheme } from "./types";
import { buildThemeSpec, applySlideDesign } from "./layouts/theme";
import { resolveSlide } from "./layouts/specs";
import {
  CANVAS_H,
  CANVAS_W,
  type ChartEl,
  type IconEl,
  type ImageEl,
  type LayoutEl,
  type ShapeEl,
  type TextEl,
  type ThemeSpec,
} from "./layouts/types";
import { iconPngDataUri } from "./icons";

// ---------------------------------------------------------------------------
// PPTX renderer. Consumes the SAME resolved layout specs as the HTML preview
// (lib/layouts/specs.ts) — inches and points are used directly, colors come
// from the theme role map. Charts are native addChart() objects.
// ---------------------------------------------------------------------------

export interface ExportOptions {
  // url -> data URI for image elements, pre-fetched by the caller.
  imageData?: Record<string, string>;
  // Resolved brand logo, when presentation.logoWatermark is set.
  logoDataUri?: string;
  // Free-plan export watermark ("Made with DeckeFlow"), independent of
  // the user's own logoWatermark above.
  planWatermark?: boolean;
}

function safeFileName(title: string): string {
  const base = title.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  return `${base || "presentation"}.pptx`;
}

const SHAPE_MAP = {
  rect: "rect",
  roundRect: "roundRect",
  ellipse: "ellipse",
  chevron: "chevron",
  trapezoid: "trapezoid",
} as const;

const SHADOW = {
  type: "outer" as const,
  color: "1A2233",
  opacity: 0.2,
  blur: 9,
  offset: 3,
  angle: 90,
};

export async function exportDeckToPptx(
  presentation: Presentation,
  slides: Slide[],
  theme: TemplateTheme,
  options: ExportOptions = {},
): Promise<void> {
  const baseSpec = buildThemeSpec(theme, presentation.themeOverrides);
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 — set before adding slides
  pptx.author = "DeckeFlow";
  pptx.title = presentation.title;

  const ordered = [...slides].sort((a, b) => a.orderIndex - b.orderIndex);
  const total = ordered.length;

  // Pre-rasterize any icons used (semantic name + color role pairs), across
  // every slide's effective (base + per-slide override) spec.
  const iconCache = new Map<string, string>();
  for (const slide of ordered) {
    const spec = applySlideDesign(baseSpec, slide.slideDesign);
    const resolved = resolveSlide(slide, {
      index: slide.orderIndex,
      total,
      deckTitle: presentation.title,
      spec,
    });
    for (const el of resolved.elements) {
      if (el.kind === "icon") {
        const key = `${el.icon}|${el.color}`;
        if (!iconCache.has(key)) {
          try {
            const png = await iconPngDataUri(el.icon, spec.colors[el.color], 256);
            if (png) iconCache.set(key, png);
          } catch {
            /* fall back to marker tile */
          }
        }
      }
    }
  }

  ordered.forEach((slide) => {
    const spec = applySlideDesign(baseSpec, slide.slideDesign);
    const resolved = resolveSlide(slide, {
      index: slide.orderIndex,
      total,
      deckTitle: presentation.title,
      spec,
    });
    const s = pptx.addSlide();
    s.background = { color: spec.colors[resolved.background] };
    if (spec.backgroundImageUri) {
      // Full-bleed background photo (Design tab, Phase 4) with a subtle
      // theme-color overlay so slide content stays readable over any photo —
      // matches the 0.15-opacity overlay used in the HTML preview.
      s.background = { data: spec.backgroundImageUri };
      s.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: CANVAS_W,
        h: CANVAS_H,
        fill: { color: spec.colors[resolved.background], transparency: 85 },
        line: { type: "none" },
      });
    }
    for (const el of resolved.elements) {
      renderEl(pptx, s, el, spec, options, iconCache);
    }
    if (presentation.logoWatermark && options.logoDataUri) {
      renderWatermark(s, presentation.logoWatermark, options.logoDataUri);
    }
    if (options.planWatermark) {
      s.addText("Made with DeckeFlow — deckeflow.com", {
        x: 0.1,
        y: CANVAS_H - 0.4,
        w: CANVAS_W - 0.2,
        h: 0.3,
        fontSize: 9,
        color: "AAAAAA",
        align: "center",
        italic: true,
      });
    }
    if (slide.speakerNotes) s.addNotes(slide.speakerNotes);
  });

  await pptx.writeFile({ fileName: safeFileName(presentation.title) });
}

function renderEl(
  pptx: pptxgen,
  s: pptxgen.Slide,
  el: LayoutEl,
  spec: ThemeSpec,
  options: ExportOptions,
  iconCache: Map<string, string>,
) {
  switch (el.kind) {
    case "text":
      return renderText(s, el, spec);
    case "shape":
      return renderShape(pptx, s, el, spec);
    case "icon":
      return renderIcon(s, el, spec, iconCache);
    case "image":
      return renderImage(pptx, s, el, spec, options);
    case "chart":
      return renderChart(pptx, s, el, spec);
  }
}

function renderText(s: pptxgen.Slide, el: TextEl, spec: ThemeSpec) {
  const resolvedColor =
    el.font === "head" && spec.headlineOverride
      ? spec.headlineOverride
      : el.color === "textBody" && spec.bodyOverride
      ? spec.bodyOverride
      : spec.colors[el.color];
  // Fresh options object per call — pptxgenjs mutates them.
  s.addText(el.text, {
    x: el.x,
    y: el.y,
    w: el.w,
    h: el.h,
    margin: 0,
    fontFace: el.font === "head" ? spec.fontHead : spec.fontBody,
    fontSize: el.size,
    bold: el.bold,
    italic: el.italic,
    color: resolvedColor,
    align: el.align ?? "left",
    valign: el.valign ?? "top",
    lineSpacingMultiple: el.lineSpacing,
    charSpacing: el.charSpacing,
    fit: el.shrink ? "shrink" : undefined,
    wrap: true,
  });
}

function renderShape(
  pptx: pptxgen,
  s: pptxgen.Slide,
  el: ShapeEl,
  spec: ThemeSpec,
) {
  const opts: Record<string, unknown> = {
    x: el.x,
    y: el.y,
    w: el.w,
    h: el.h,
    fill: {
      color: spec.colors[el.fill],
      ...(el.transparency ? { transparency: el.transparency } : {}),
    },
    line: el.line
      ? { color: spec.colors[el.line.color], width: el.line.width }
      : { type: "none" },
  };
  if (el.shape === "roundRect" && el.radius) opts.rectRadius = el.radius;
  if (el.shadow) opts.shadow = { ...SHADOW };
  if (el.flipV) opts.flipV = true;
  s.addShape(pptx.ShapeType[SHAPE_MAP[el.shape]], opts);
}

function renderIcon(
  s: pptxgen.Slide,
  el: IconEl,
  spec: ThemeSpec,
  iconCache: Map<string, string>,
) {
  const png = iconCache.get(`${el.icon}|${el.color}`);
  if (png) {
    s.addImage({ data: png, x: el.x, y: el.y, w: el.w, h: el.h });
  }
  // No PNG (unknown icon / rasterize failed): the marker tile behind the icon
  // still reads as a bullet marker, so we render nothing extra.
}

function renderImage(
  pptx: pptxgen,
  s: pptxgen.Slide,
  el: ImageEl,
  spec: ThemeSpec,
  options: ExportOptions,
) {
  const data = el.url ? options.imageData?.[el.url] : undefined;
  if (data) {
    s.addImage({
      data,
      x: el.x,
      y: el.y,
      w: el.w,
      h: el.h,
      sizing: { type: "cover", w: el.w, h: el.h },
    });
  } else {
    // Graceful fallback: solid theme fill.
    s.addShape(pptx.ShapeType.rect, {
      x: el.x,
      y: el.y,
      w: el.w,
      h: el.h,
      fill: { color: spec.colors[el.fallback] },
      line: { type: "none" },
    });
  }
  if (el.overlay) {
    s.addShape(pptx.ShapeType.rect, {
      x: el.x,
      y: el.y,
      w: el.w,
      h: el.h,
      fill: {
        color: spec.colors[el.overlay.color],
        transparency: el.overlay.transparency,
      },
      line: { type: "none" },
    });
  }
}

function renderWatermark(
  s: pptxgen.Slide,
  watermark: NonNullable<Presentation["logoWatermark"]>,
  logoDataUri: string,
) {
  const h = watermark.size === "small" ? CANVAS_H * 0.06 : CANVAS_H * 0.09;
  const maxW = CANVAS_W * 0.18;
  const margin = 0.3;
  const x = watermark.position.includes("left") ? margin : CANVAS_W - maxW - margin;
  const y = watermark.position.includes("top") ? margin : CANVAS_H - h - margin;
  // pptxgenjs's ImageProps has no opacity/transparency option, so the export
  // renders the logo at full opacity (the HTML preview applies 0.82 opacity).
  s.addImage({
    data: logoDataUri,
    x,
    y,
    w: maxW,
    h,
    sizing: { type: "contain", w: maxW, h },
  });
}

function renderChart(
  pptx: pptxgen,
  s: pptxgen.Slide,
  el: ChartEl,
  spec: ThemeSpec,
) {
  const chart = el.chart;
  const data = chart.series.map((ser) => ({
    name: ser.name,
    labels: chart.labels,
    values: ser.values,
  }));
  const single = data.length === 1;
  const muted = spec.colors.textMuted;

  const common = {
    x: el.x,
    y: el.y,
    w: el.w,
    h: el.h,
    chartColors: [...spec.chartPalette],
    showTitle: false,
    showLegend: !single,
    legendPos: "b" as const,
    legendColor: muted,
    dataLabelFontFace: spec.fontBody,
    dataLabelFontSize: 9,
  };

  if (chart.type === "pie") {
    s.addChart(pptx.ChartType.pie, data, {
      ...common,
      showLegend: true,
      legendPos: "r",
      showPercent: true,
      showValue: false,
      dataLabelColor: "FFFFFF",
    });
    return;
  }

  s.addChart(
    chart.type === "line" ? pptx.ChartType.line : pptx.ChartType.bar,
    data,
    {
      ...common,
      showValue: chart.type === "bar",
      dataLabelColor: muted,
      barDir: "col",
      catAxisLabelColor: muted,
      catAxisLabelFontFace: spec.fontBody,
      catAxisLabelFontSize: 10,
      valAxisLabelColor: muted,
      valAxisLabelFontSize: 10,
      catGridLine: { style: "none" },
      valGridLine: { style: "none" },
      lineSize: chart.type === "line" ? 3 : undefined,
      lineSmooth: chart.type === "line",
    },
  );
}

export { CANVAS_W, CANVAS_H };
