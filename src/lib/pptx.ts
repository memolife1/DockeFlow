import pptxgen from "pptxgenjs";
import type { Presentation, Slide, TemplateTheme } from "./types";

// Builds a real .pptx from the deck and triggers a browser download.
// Data-bearing slides get native, editable PowerPoint chart objects via
// pptxgenjs addChart() — not flat images.

const hex = (c: string) => c.replace("#", "").toUpperCase();

// A restrained multi-series palette derived from the template accent.
function chartPalette(accent: string): string[] {
  return [hex(accent), "94A3B8", "1F2937", "CBD5E1", "64748B", "0EA5E9"];
}

function safeFileName(title: string): string {
  const base = title.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  return `${base || "presentation"}.pptx`;
}

export async function exportDeckToPptx(
  presentation: Presentation,
  slides: Slide[],
  theme: TemplateTheme,
): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in, 16:9
  pptx.author = "DeckeFlow";
  pptx.title = presentation.title;

  const accent = hex(theme.accent);
  const ink = hex(theme.ink || "#1A1B21");
  const muted = "5F6470";
  const bodyFont = theme.fontFamily === "serif" ? "Georgia" : "Plus Jakarta Sans";
  const W = 13.33;

  const ordered = [...slides].sort((a, b) => a.orderIndex - b.orderIndex);

  ordered.forEach((slide, i) => {
    const s = pptx.addSlide();
    s.background = { color: "FFFFFF" };

    // Left accent rule + eyebrow, consistent with the on-screen deck.
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.14,
      h: 7.5,
      fill: { color: accent },
      line: { type: "none" },
    });

    const isTitle = slide.layoutType === "title";
    const isSection = slide.layoutType === "section";
    const centered = isTitle || isSection;
    const hasChart = !!slide.chart && slide.chart.labels.length > 0;

    // Eyebrow / slide kind label
    s.addText(isTitle ? "DECKEFLOW" : slide.layoutType.replace("-", " ").toUpperCase(), {
      x: 0.6,
      y: 0.45,
      w: 8,
      h: 0.3,
      fontFace: "Plus Jakarta Sans",
      fontSize: 11,
      bold: true,
      color: accent,
      charSpacing: 2,
    });

    // Page number
    s.addText(`${String(i + 1).padStart(2, "0")} / ${String(ordered.length).padStart(2, "0")}`, {
      x: W - 2.2,
      y: 0.45,
      w: 1.6,
      h: 0.3,
      align: "right",
      fontFace: "Plus Jakarta Sans",
      fontSize: 11,
      color: muted,
    });

    if (centered) {
      s.addText(slide.title, {
        x: 0.6,
        y: 2.4,
        w: 11.8,
        h: 2.2,
        fontFace: bodyFont,
        fontSize: isTitle ? 44 : 40,
        bold: true,
        color: ink,
        valign: "middle",
      });
      if (slide.content[0]) {
        s.addText(slide.content[0], {
          x: 0.6,
          y: 4.5,
          w: 10,
          h: 0.8,
          fontFace: "Plus Jakarta Sans",
          fontSize: 18,
          color: muted,
        });
      }
    } else {
      // Title
      s.addText(slide.title, {
        x: 0.6,
        y: 1.0,
        w: 12,
        h: 1.0,
        fontFace: bodyFont,
        fontSize: 30,
        bold: true,
        color: ink,
      });

      const bulletW = hasChart ? 5.6 : 11.8;
      const bullets = slide.content.filter(Boolean);
      if (bullets.length) {
        s.addText(
          bullets.map((line) => ({
            text: line,
            options: { bullet: { code: "2022", indent: 18 }, paraSpaceAfter: 10 },
          })),
          {
            x: 0.6,
            y: 2.1,
            w: bulletW,
            h: 4.6,
            fontFace: "Plus Jakarta Sans",
            fontSize: 16,
            color: "333640",
            valign: "top",
            lineSpacingMultiple: 1.1,
          },
        );
      }

      if (hasChart && slide.chart) {
        renderChart(pptx, s, slide.chart, accent, {
          x: 6.6,
          y: 2.0,
          w: 6.2,
          h: 4.7,
        });
      }
    }

    if (slide.speakerNotes) s.addNotes(slide.speakerNotes);
  });

  await pptx.writeFile({ fileName: safeFileName(presentation.title) });
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
    dataLabelFontSize: 9,
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
    catAxisLabelFontSize: 10,
    valAxisLabelColor: "5F6470",
    valAxisLabelFontSize: 10,
    valGridLine: { style: "none" },
    lineSize: chart.type === "line" ? 3 : undefined,
    lineSmooth: chart.type === "line",
  });
}
