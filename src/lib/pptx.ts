import pptxgen from "pptxgenjs";
import type { Presentation, Slide, TemplateTheme } from "./types";

// Builds a real .pptx from the deck and triggers a browser download.
// Data-bearing slides get native, editable PowerPoint chart objects via
// pptxgenjs addChart() — not flat images.
//
// Layout system (LAYOUT_WIDE = 13.33 x 7.5 in, 16:9):
//  - Title: accent left panel (35%) + text on the right; optional full-bleed
//    stock photo with a dark overlay behind the text.
//  - Content: full-width accent top bar, generous margins, large type.
//  - Section: full accent background, centered white title.
//  - Data: light-gray backdrop behind the chart to separate it.

const EMU_W = 13.33;
const EMU_H = 7.5;
const MARGIN = 0.6; // >= 0.5in on every edge
const DARK = "0F172A"; // slate-900, for dark title / stat slides

const hex = (c: string) => c.replace("#", "").toUpperCase();

function chartPalette(accent: string): string[] {
  return [hex(accent), "94A3B8", "1F2937", "CBD5E1", "64748B", "0EA5E9"];
}

function safeFileName(title: string): string {
  const base = title.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  return `${base || "presentation"}.pptx`;
}

export interface ExportOptions {
  // Base64 data URI for a title-slide background image (Pexels). When omitted
  // the title uses the solid colored left-panel layout.
  titleImageDataUri?: string;
}

export async function exportDeckToPptx(
  presentation: Presentation,
  slides: Slide[],
  theme: TemplateTheme,
  options: ExportOptions = {},
): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "DeckeFlow";
  pptx.title = presentation.title;

  const accent = hex(theme.accent);
  const ink = hex(theme.ink || "#1A1B21");
  const muted = "5F6470";
  const display = theme.fontFamily === "serif" ? "Georgia" : "Plus Jakarta Sans";
  const body = "Plus Jakarta Sans";

  const ordered = [...slides].sort((a, b) => a.orderIndex - b.orderIndex);

  ordered.forEach((slide, i) => {
    const s = pptx.addSlide();
    s.background = { color: "FFFFFF" };

    const p = { accent, ink, muted, display, body };
    if (slide.layoutType === "title") {
      renderTitle(pptx, s, slide, p, options);
    } else if (slide.layoutType === "section") {
      renderSection(s, slide, { accent, display, body });
    } else if (slide.layoutType === "stat-block" && slide.stats?.length) {
      renderStatBlock(pptx, s, slide, i, ordered.length, {
        ...p,
        deckTitle: presentation.title,
      });
    } else if (slide.layoutType === "two-column" && slide.columns?.length) {
      renderTwoColumn(pptx, s, slide, i, ordered.length, {
        ...p,
        deckTitle: presentation.title,
      });
    } else {
      renderContent(pptx, s, slide, i, ordered.length, {
        ...p,
        deckTitle: presentation.title,
      });
    }

    if (slide.speakerNotes) s.addNotes(slide.speakerNotes);
  });

  await pptx.writeFile({ fileName: safeFileName(presentation.title) });
}

interface Palette {
  accent: string;
  ink: string;
  display: string;
  body: string;
  muted: string;
}

function renderTitle(
  pptx: pptxgen,
  s: pptxgen.Slide,
  slide: Slide,
  p: Palette,
  options: ExportOptions,
) {
  const hasImage = !!options.titleImageDataUri;

  if (hasImage) {
    // Full-bleed photo + dark overlay for legibility.
    s.addImage({
      data: (options.titleImageDataUri as string).replace(/^data:/, ""),
      x: 0,
      y: 0,
      w: EMU_W,
      h: EMU_H,
      sizing: { type: "cover", w: EMU_W, h: EMU_H },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: EMU_W,
      h: EMU_H,
      fill: { color: "000000", transparency: 40 },
      line: { type: "none" },
    });
  } else {
    // Dark title slide with an accent bar down the left edge.
    s.background = { color: DARK };
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.16,
      h: EMU_H,
      fill: { color: p.accent },
      line: { type: "none" },
    });
  }

  // Brand mark, in accent (or white over a photo).
  s.addText("DECKEFLOW", {
    x: MARGIN,
    y: 0.6,
    w: 5,
    h: 0.3,
    fontFace: p.body,
    fontSize: 12,
    bold: true,
    color: hasImage ? "FFFFFF" : p.accent,
    charSpacing: 3,
  });

  s.addText(slide.title, {
    x: MARGIN,
    y: 2.5,
    w: EMU_W - MARGIN * 2,
    h: 2.6,
    fontFace: p.display,
    fontSize: 44,
    bold: true,
    color: "FFFFFF",
    valign: "bottom",
    lineSpacingMultiple: 1.0,
  });
  if (slide.content[0]) {
    s.addText(slide.content[0], {
      x: MARGIN,
      y: 5.25,
      w: EMU_W - MARGIN * 2 - 1.5,
      h: 1.5,
      fontFace: p.body,
      fontSize: 19,
      color: "CBD5E1",
      valign: "top",
      lineSpacingMultiple: 1.15,
    });
  }
}

function renderSection(
  s: pptxgen.Slide,
  slide: Slide,
  p: Pick<Palette, "accent" | "display" | "body">,
) {
  s.background = { color: p.accent };
  s.addText(slide.title, {
    x: 1.2,
    y: 2.4,
    w: EMU_W - 2.4,
    h: 2.7,
    fontFace: p.display,
    fontSize: 40,
    bold: true,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
    lineSpacingMultiple: 1.02,
  });
  if (slide.content[0]) {
    s.addText(slide.content[0], {
      x: 1.6,
      y: 5.1,
      w: EMU_W - 3.2,
      h: 0.8,
      fontFace: p.body,
      fontSize: 19,
      color: "FFFFFF",
      align: "center",
    });
  }
}

function renderContent(
  pptx: pptxgen,
  s: pptxgen.Slide,
  slide: Slide,
  index: number,
  total: number,
  p: Palette & { deckTitle: string },
) {
  // Full-width accent top bar (~8pt).
  s.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: EMU_W,
    h: 0.11,
    fill: { color: p.accent },
    line: { type: "none" },
  });

  const hasChart = !!slide.chart && slide.chart.labels.length > 0;

  // Assertion headline.
  s.addText(slide.title, {
    x: MARGIN,
    y: 0.55,
    w: EMU_W - MARGIN * 2,
    h: 1.4,
    fontFace: p.display,
    fontSize: 30,
    bold: true,
    color: p.ink,
    valign: "top",
    lineSpacingMultiple: 1.02,
  });

  const bullets = slide.content.filter(Boolean);
  const bulletW = hasChart ? 5.7 : EMU_W - MARGIN * 2;
  if (bullets.length) {
    s.addText(
      bullets.map((line) => ({
        text: line,
        options: { bullet: { code: "2022", indent: 20 }, paraSpaceAfter: 14 },
      })),
      {
        x: MARGIN,
        y: 2.15,
        w: bulletW,
        h: 4.5,
        fontFace: p.body,
        fontSize: 19,
        color: "333640",
        valign: "top",
        lineSpacingMultiple: 1.12,
      },
    );
  }

  if (hasChart && slide.chart) {
    const box = { x: 6.75, y: 2.2, w: EMU_W - 6.75 - MARGIN, h: 4.35 };
    // Light-gray backdrop to separate the chart from the slide.
    s.addShape(pptx.ShapeType.roundRect, {
      x: box.x - 0.2,
      y: box.y - 0.2,
      w: box.w + 0.4,
      h: box.h + 0.4,
      rectRadius: 0.08,
      fill: { color: "F2F3F7" },
      line: { type: "none" },
    });
    renderChart(pptx, s, slide.chart, p.accent, box);
  }

  // Footer: deck title + page number (12pt).
  s.addText(p.deckTitle, {
    x: MARGIN,
    y: EMU_H - 0.5,
    w: 8,
    h: 0.3,
    fontFace: p.body,
    fontSize: 12,
    color: p.muted,
  });
  s.addText(`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    x: EMU_W - 2.2,
    y: EMU_H - 0.5,
    w: 1.6,
    h: 0.3,
    align: "right",
    fontFace: p.body,
    fontSize: 12,
    color: p.muted,
  });
}

// Footer with deck title + page number, shared by content-style slides.
function addFooter(
  s: pptxgen.Slide,
  deckTitle: string,
  index: number,
  total: number,
  body: string,
  muted: string,
) {
  s.addText(deckTitle, {
    x: MARGIN,
    y: EMU_H - 0.5,
    w: 8,
    h: 0.3,
    fontFace: body,
    fontSize: 12,
    color: muted,
  });
  s.addText(
    `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
    {
      x: EMU_W - 2.2,
      y: EMU_H - 0.5,
      w: 1.6,
      h: 0.3,
      align: "right",
      fontFace: body,
      fontSize: 12,
      color: muted,
    },
  );
}

// Dark stat-block slide: assertion headline over a row of big accent numbers.
function renderStatBlock(
  pptx: pptxgen,
  s: pptxgen.Slide,
  slide: Slide,
  index: number,
  total: number,
  p: Palette & { deckTitle: string },
) {
  s.background = { color: DARK };
  s.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: EMU_W,
    h: 0.11,
    fill: { color: p.accent },
    line: { type: "none" },
  });

  s.addText(slide.title, {
    x: MARGIN,
    y: 0.55,
    w: EMU_W - MARGIN * 2,
    h: 1.3,
    fontFace: p.display,
    fontSize: 30,
    bold: true,
    color: "FFFFFF",
    valign: "top",
    lineSpacingMultiple: 1.02,
  });

  const stats = slide.stats ?? [];
  const n = Math.min(stats.length, 4);
  const gap = 0.4;
  const colW = (EMU_W - MARGIN * 2 - gap * (n - 1)) / n;
  stats.slice(0, n).forEach((stat, i) => {
    const x = MARGIN + i * (colW + gap);
    // Card
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.5,
      w: colW,
      h: 3.4,
      rectRadius: 0.1,
      fill: { color: "1E293B" },
      line: { color: "334155", width: 1 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x,
      y: 2.5,
      w: colW,
      h: 0.08,
      fill: { color: p.accent },
      line: { type: "none" },
    });
    s.addText(stat.value, {
      x,
      y: 2.9,
      w: colW,
      h: 1.5,
      align: "center",
      valign: "middle",
      fontFace: p.display,
      fontSize: 44,
      bold: true,
      color: "FFFFFF",
    });
    s.addText(stat.label, {
      x: x + 0.2,
      y: 4.5,
      w: colW - 0.4,
      h: 1.2,
      align: "center",
      valign: "top",
      fontFace: p.body,
      fontSize: 13,
      color: "94A3B8",
      lineSpacingMultiple: 1.1,
    });
  });

  addFooter(s, p.deckTitle, index, total, p.body, "64748B");
}

// Two-column comparison: light left panel vs. dark right panel.
function renderTwoColumn(
  pptx: pptxgen,
  s: pptxgen.Slide,
  slide: Slide,
  index: number,
  total: number,
  p: Palette & { deckTitle: string },
) {
  s.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: EMU_W,
    h: 0.11,
    fill: { color: p.accent },
    line: { type: "none" },
  });
  s.addText(slide.title, {
    x: MARGIN,
    y: 0.55,
    w: EMU_W - MARGIN * 2,
    h: 1.3,
    fontFace: p.display,
    fontSize: 28,
    bold: true,
    color: p.ink,
    valign: "top",
    lineSpacingMultiple: 1.02,
  });

  const cols = slide.columns ?? [];
  const top = 2.2;
  const h = EMU_H - top - 0.8;
  const gap = 0.5;
  const colW = (EMU_W - MARGIN * 2 - gap) / 2;

  cols.slice(0, 2).forEach((col, i) => {
    const x = MARGIN + i * (colW + gap);
    const dark = i === 1;
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y: top,
      w: colW,
      h,
      rectRadius: 0.08,
      fill: { color: dark ? DARK : "F8FAFC" },
      line: { color: dark ? DARK : "E2E8F0", width: 1 },
    });
    s.addText(col.heading, {
      x: x + 0.4,
      y: top + 0.35,
      w: colW - 0.8,
      h: 0.6,
      fontFace: p.display,
      fontSize: 15,
      bold: true,
      color: dark ? "FFFFFF" : p.accent,
    });
    if (col.points.length) {
      s.addText(
        col.points.map((pt) => ({
          text: pt,
          options: { bullet: { code: "2022", indent: 16 }, paraSpaceAfter: 10 },
        })),
        {
          x: x + 0.4,
          y: top + 1.15,
          w: colW - 0.8,
          h: h - 1.5,
          fontFace: p.body,
          fontSize: 13,
          color: dark ? "CBD5E1" : "334155",
          valign: "top",
          lineSpacingMultiple: 1.1,
        },
      );
    }
  });

  addFooter(s, p.deckTitle, index, total, p.body, p.muted);
}

function renderChart(
  pptx: pptxgen,
  slide: pptxgen.Slide,
  chart: NonNullable<Slide["chart"]>,
  accent: string,
  box: { x: number; y: number; w: number; h: number },
) {
  const data = chart.series.map((ser) => ({
    name: ser.name,
    labels: chart.labels,
    values: ser.values,
  }));

  const typeMap = {
    bar: pptx.ChartType.bar,
    line: pptx.ChartType.line,
    pie: pptx.ChartType.pie,
  } as const;

  const common = {
    ...box,
    chartColors: chartPalette(accent),
    showTitle: !!chart.title,
    title: chart.title,
    titleColor: "1A1B21",
    titleFontFace: "Plus Jakarta Sans",
    titleFontSize: 13,
    showLegend: chart.type !== "pie" && data.length > 1,
    legendPos: "b" as const,
    legendColor: "5F6470",
    dataLabelColor: chart.type === "pie" ? "FFFFFF" : "5F6470",
    dataLabelFontFace: "Plus Jakarta Sans",
    dataLabelFontSize: 10,
  };

  if (chart.type === "pie") {
    slide.addChart(typeMap.pie, data, {
      ...common,
      showPercent: true,
      showValue: false,
      showLabel: false,
    });
    return;
  }

  slide.addChart(typeMap[chart.type], data, {
    ...common,
    showValue: chart.type === "bar",
    barDir: "col",
    catAxisLabelColor: "5F6470",
    catAxisLabelFontFace: "Plus Jakarta Sans",
    catAxisLabelFontSize: 11,
    valAxisLabelColor: "5F6470",
    valAxisLabelFontSize: 11,
    valGridLine: { style: "none" },
    lineSize: chart.type === "line" ? 3 : undefined,
    lineSmooth: chart.type === "line",
  });
}
