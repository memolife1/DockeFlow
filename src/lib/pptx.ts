import pptxgen from "pptxgenjs";
import type { Presentation, Slide, TemplateTheme } from "./types";
import { buildThemeSpec } from "./layouts/theme";
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
  const spec = buildThemeSpec(theme);
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 — set before adding slides
  pptx.author = "DeckeFlow";
  pptx.title = presentation.title;

  const ordered = [...slides].sort((a, b) => a.orderIndex - b.orderIndex);
  const total = ordered.length;

  // Pre-rasterize any icons used (semantic name + color role pairs).
  const iconCache = new Map<string, string>();
  for (const slide of ordered) {
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
    const resolved = resolveSlide(slide, {
      index: slide.orderIndex,
      total,
      deckTitle: presentation.title,
      spec,
    });
    const s = pptx.addSlide();
    s.background = { color: spec.colors[resolved.background] };
    for (const el of resolved.elements) {
      renderEl(pptx, s, el, spec, options, iconCache);
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
    color: spec.colors[el.color],
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
