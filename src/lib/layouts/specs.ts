import type { LayoutId, Slide } from "../types";
import {
  CANVAS_H as H,
  CANVAS_W as W,
  MARGIN as M,
  type ColorRole,
  type LayoutEl,
  type ResolveCtx,
  type ResolvedSlide,
  type ShapeEl,
  type TextEl,
} from "./types";

// ---------------------------------------------------------------------------
// The premium layout library. Each layout is a pure function from slide
// content to positioned elements (inches / points / color roles). No hex
// colors, no accent underlines, no edge stripes — whitespace, tints, and
// shadows carry the design.
// ---------------------------------------------------------------------------

const LAYOUT_IDS: LayoutId[] = [
  "title_hero",
  "title_split",
  "agenda",
  "section_divider",
  "content_bullets",
  "content_image_right",
  "content_image_left",
  "two_column_compare",
  "stat_kpi",
  "timeline_horizontal",
  "process_steps",
  "funnel",
  "swot_matrix",
  "chart_focus",
  "team_grid",
  "closing_cta",
  "image_full_bleed",
  "image_two_column",
  "image_four_grid",
  "image_showcase",
];

export function isLayoutId(v: string): v is LayoutId {
  return (LAYOUT_IDS as string[]).includes(v);
}

// Legacy layout names -> nearest new layout.
export function resolveLayoutId(slide: Slide): LayoutId {
  const lt = slide.layoutType as string;
  if (isLayoutId(lt)) return lt;
  switch (lt) {
    case "title":
      return "title_hero";
    case "agenda":
      return "agenda";
    case "section":
    case "quote":
      return "section_divider";
    case "stat-block":
      return "stat_kpi";
    case "closing":
      return "closing_cta";
    case "two-column":
      return slide.columns?.length ? "two_column_compare" : "content_bullets";
    case "content":
    default:
      if (slide.chart) return "chart_focus";
      if (slide.imageUrl || slide.imageQuery) return "content_image_right";
      return "content_bullets";
  }
}

// ---- tiny element builders -------------------------------------------------

function txt(
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  size: number,
  color: ColorRole,
  extra: Partial<TextEl> = {},
): TextEl {
  return { kind: "text", x, y, w, h, text, size, color, ...extra };
}

function box(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: ColorRole,
  extra: Partial<ShapeEl> = {},
): ShapeEl {
  return { kind: "shape", shape: "rect", x, y, w, h, fill, ...extra };
}

function card(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: ColorRole,
  extra: Partial<ShapeEl> = {},
): ShapeEl {
  return {
    kind: "shape",
    shape: "roundRect",
    x,
    y,
    w,
    h,
    fill,
    radius: 0.09,
    ...extra,
  };
}

// Icon-or-marker bullet rows. Marker is a small rounded tile; when the slide
// provides a semantic icon name it renders as an icon in both outputs.
function bulletRows(
  bullets: string[],
  icons: (string | null)[] | undefined,
  x: number,
  startY: number,
  w: number,
  opts: {
    rowH?: number;
    size?: number;
    color?: ColorRole;
    markerColor?: ColorRole;
    markerTint?: ColorRole;
    max?: number;
  } = {},
): LayoutEl[] {
  const {
    rowH = 0.86,
    size = 14,
    color = "textBody",
    markerColor = "primary",
    markerTint = "primaryTint",
    max = 5,
  } = opts;
  const els: LayoutEl[] = [];
  bullets.slice(0, max).forEach((b, i) => {
    const y = startY + i * rowH;
    const icon = icons?.[i];
    // Marker tile
    els.push(card(x, y + 0.06, 0.34, 0.34, markerTint, { radius: 0.07 }));
    if (icon) {
      els.push({ kind: "icon", icon, color: markerColor, x: x + 0.06, y: y + 0.12, w: 0.22, h: 0.22 });
    } else {
      els.push(card(x + 0.11, y + 0.17, 0.12, 0.12, markerColor, { radius: 0.04 }));
    }
    els.push(
      txt(x + 0.52, y, w - 0.52, rowH - 0.1, b, size, color, {
        valign: "top",
        lineSpacing: 1.12,
        shrink: true,
        maxLines: 2,
      }),
    );
  });
  return els;
}

function pageFooter(ctx: ResolveCtx, onDark = false): LayoutEl[] {
  const c: ColorRole = onDark ? "textOnDarkMuted" : "textMuted";
  return [
    txt(M, H - 0.46, 6, 0.3, ctx.deckTitle, 9, c, { valign: "middle" }),
    txt(W - 1.75, H - 0.46, 1.0, 0.3, `${String(ctx.index + 1).padStart(2, "0")} / ${String(ctx.total).padStart(2, "0")}`, 9, c, {
      align: "right",
      valign: "middle",
    }),
  ];
}

// Renders the uploaded brand's real logo image when the theme has one;
// otherwise falls back to a text wordmark (the extracted brand name, or
// "DECKEFLOW" for unbranded decks).
function brandMark(color: ColorRole, ctx?: ResolveCtx): LayoutEl {
  if (ctx?.spec?.logoDataUri) {
    return {
      kind: "image",
      x: M,
      y: 0.32,
      w: 1.5,
      h: 0.45,
      url: ctx.spec.logoDataUri,
      fallback: "surface",
    };
  }
  return txt(M, 0.55, 4, 0.32, (ctx?.spec?.brandName ?? "DeckeFlow").toUpperCase(), 11, color, {
    bold: true,
    charSpacing: 3,
    valign: "middle",
  });
}

// ---- layouts ----------------------------------------------------------------

type LayoutFn = (s: Slide, ctx: ResolveCtx) => ResolvedSlide;

const titleHero: LayoutFn = (s, ctx) => {
  const els: LayoutEl[] = [];
  const hasImage = !!s.imageUrl;
  if (hasImage) {
    els.push({ kind: "image", x: 0, y: 0, w: W, h: H, url: s.imageUrl, query: s.imageQuery, fallback: "dark" });
    els.push(box(0, 0, W, H, "dark", { transparency: 32 }));
  } else {
    // Decorative geometry, right side: large quiet ring + solid orb.
    els.push({ kind: "shape", shape: "ellipse", x: W - 4.1, y: -1.5, w: 5.6, h: 5.6, fill: "primary", transparency: 82 });
    els.push({ kind: "shape", shape: "ellipse", x: W - 2.6, y: 3.9, w: 3.4, h: 3.4, fill: "primary", transparency: 60 });
    els.push({ kind: "shape", shape: "ellipse", x: W - 3.4, y: 2.1, w: 1.15, h: 1.15, fill: "primary" });
  }
  els.push(brandMark(hasImage ? "textOnDark" : "primaryTint", ctx));
  els.push(
    txt(M, 3.35, 8.6, 2.15, s.title, 40, "textOnDark", {
      bold: true,
      font: "head",
      valign: "bottom",
      lineSpacing: 1.02,
      shrink: true,
    }),
  );
  if (s.content[0]) {
    els.push(
      txt(M, 5.72, 8.0, 1.15, s.content[0], 15, "textOnDarkMuted", {
        valign: "top",
        lineSpacing: 1.25,
        shrink: true,
      }),
    );
  }
  return { background: "dark", elements: els };
};

const titleSplit: LayoutFn = (s, ctx) => {
  const panelW = W * 0.38;
  const els: LayoutEl[] = [
    box(0, 0, panelW, H, "dark"),
    brandMark("textOnDark", ctx),
    txt(M, 2.9, panelW - M - 0.35, 2.5, s.title, 32, "textOnDark", {
      bold: true,
      font: "head",
      valign: "bottom",
      lineSpacing: 1.05,
      shrink: true,
    }),
  ];
  if (s.content[0]) {
    els.push(
      txt(M, 5.6, panelW - M - 0.35, 1.3, s.content[0], 13, "textOnDarkMuted", {
        lineSpacing: 1.25,
        shrink: true,
      }),
    );
  }
  // Light right side with a large decorative element.
  els.push({ kind: "shape", shape: "ellipse", x: panelW + 1.6, y: 1.15, w: 5.2, h: 5.2, fill: "primaryTint" });
  els.push({ kind: "shape", shape: "ellipse", x: panelW + 3.0, y: 2.55, w: 2.4, h: 2.4, fill: "primary" });
  return { background: "surface", elements: els };
};

const agenda: LayoutFn = (s, ctx) => {
  const items = s.content.filter(Boolean).slice(0, 8);
  const twoCol = items.length > 5;
  const perCol = twoCol ? Math.ceil(items.length / 2) : items.length;
  const colW = twoCol ? (W - M * 2 - 0.7) / 2 : W - M * 2;
  const rowH = 0.92;
  const els: LayoutEl[] = [
    txt(M, 0.8, W - M * 2, 0.95, s.title || "Agenda", 32, "textBody", {
      bold: true,
      font: "head",
      shrink: true,
    }),
  ];
  items.forEach((item, i) => {
    const col = twoCol ? Math.floor(i / perCol) : 0;
    const row = twoCol ? i % perCol : i;
    const x = M + col * (colW + 0.7);
    const y = 2.15 + row * rowH;
    els.push(
      txt(x, y, 0.75, rowH - 0.15, String(i + 1).padStart(2, "0"), 24, "primary", {
        bold: true,
        font: "head",
        valign: "top",
      }),
    );
    els.push(
      txt(x + 0.95, y + 0.07, colW - 0.95, rowH - 0.15, item, 14, "textBody", {
        valign: "top",
        lineSpacing: 1.1,
        shrink: true,
        maxLines: 2,
      }),
    );
  });
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const sectionDivider: LayoutFn = (s, ctx) => {
  const num = s.sectionNumber ?? ctx.index + 1;
  const els: LayoutEl[] = [
    txt(M, 1.35, 5, 1.7, String(num).padStart(2, "0"), 60, "primaryTint", {
      bold: true,
      font: "head",
      valign: "middle",
    }),
    txt(M, 3.4, W - M * 2 - 1, 1.9, s.title, 36, "textOnDark", {
      bold: true,
      font: "head",
      valign: "top",
      lineSpacing: 1.05,
      shrink: true,
    }),
  ];
  if (s.content[0]) {
    els.push(
      txt(M, 5.5, W - M * 2 - 2.5, 1.0, s.content[0], 14, "primaryTint", {
        lineSpacing: 1.2,
        shrink: true,
      }),
    );
  }
  return { background: "primary", elements: els };
};

const contentBullets: LayoutFn = (s, ctx) => {
  const bullets = s.content.filter(Boolean);
  const els: LayoutEl[] = [
    txt(M, 0.8, W - M * 2, 1.4, s.title, 32, "textBody", {
      bold: true,
      font: "head",
      lineSpacing: 1.05,
      shrink: true,
      maxLines: 3,
    }),
    ...bulletRows(bullets, s.icons, M, 2.35, W - M * 2, { rowH: 0.92, size: 14 }),
  ];
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const contentImage = (side: "left" | "right"): LayoutFn => (s, ctx) => {
  const imgW = W * 0.45;
  const imgX = side === "right" ? W - imgW : 0;
  const textX = side === "right" ? M : imgW + 0.65;
  const textW = W - imgW - M - 0.65;
  const bullets = s.content.filter(Boolean);
  const els: LayoutEl[] = [
    {
      kind: "image",
      x: imgX,
      y: 0,
      w: imgW,
      h: H,
      url: s.imageUrl,
      query: s.imageQuery,
      fallback: "surfaceAlt",
    },
    txt(textX, 1.0, textW, 2.0, s.title, 26, "textBody", {
      bold: true,
      font: "head",
      lineSpacing: 1.05,
      shrink: true,
      maxLines: 3,
    }),
    ...bulletRows(bullets, s.icons, textX, 3.2, textW, {
      rowH: 0.95,
      size: 13,
      max: 4,
    }),
  ];
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const twoColumnCompare: LayoutFn = (s, ctx) => {
  const cols = s.columns?.length
    ? s.columns
    : [
        { heading: "Option A", points: s.content.slice(0, 3) },
        { heading: "Option B", points: s.content.slice(3, 6) },
      ];
  const top = 2.15;
  const cardH = H - top - 0.85;
  const gap = 0.5;
  const colW = (W - M * 2 - gap) / 2;
  const els: LayoutEl[] = [
    txt(M, 0.8, W - M * 2, 1.15, s.title, 30, "textBody", {
      bold: true,
      font: "head",
      lineSpacing: 1.05,
      shrink: true,
    }),
  ];
  cols.slice(0, 2).forEach((col, i) => {
    const x = M + i * (colW + gap);
    const dark = i === 1;
    els.push(card(x, top, colW, cardH, dark ? "dark" : "surfaceAlt", { shadow: true, radius: 0.12 }));
    els.push(
      txt(x + 0.45, top + 0.4, colW - 0.9, 0.5, col.heading, 15, dark ? "textOnDark" : "primary", {
        bold: true,
        font: "head",
        valign: "middle",
      }),
    );
    col.points.slice(0, 4).forEach((pt, pi) => {
      const y = top + 1.15 + pi * 0.82;
      els.push(card(x + 0.45, y + 0.05, 0.13, 0.13, dark ? "primaryTint" : "primary", { radius: 0.045 }));
      els.push(
        txt(x + 0.78, y - 0.06, colW - 1.25, 0.8, pt, 12.5, dark ? "textOnDarkMuted" : "textBody", {
          valign: "top",
          lineSpacing: 1.12,
          shrink: true,
          maxLines: 2,
        }),
      );
    });
  });
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const statKpi: LayoutFn = (s, ctx) => {
  const stats = (s.stats ?? []).slice(0, 4);
  const n = Math.max(stats.length, 1);
  const gap = 0.45;
  const cardW = (W - M * 2 - gap * (n - 1)) / n;
  const top = 2.5;
  const cardH = 3.5;
  const els: LayoutEl[] = [
    txt(M, 0.85, W - M * 2, 1.3, s.title, 32, "textBody", {
      bold: true,
      font: "head",
      lineSpacing: 1.05,
      shrink: true,
    }),
  ];
  stats.forEach((st, i) => {
    const x = M + i * (cardW + gap);
    els.push(card(x, top, cardW, cardH, "surfaceAlt", { shadow: true, radius: 0.12 }));
    els.push(
      txt(x + 0.2, top + 0.65, cardW - 0.4, 1.35, st.value, 44, "primary", {
        bold: true,
        font: "head",
        align: "center",
        valign: "middle",
        shrink: true,
      }),
    );
    els.push(
      txt(x + 0.35, top + 2.2, cardW - 0.7, 1.0, st.label, 11, "textMuted", {
        align: "center",
        valign: "top",
        lineSpacing: 1.2,
        shrink: true,
        maxLines: 3,
      }),
    );
  });
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const timelineHorizontal: LayoutFn = (s, ctx) => {
  const items: { label: string; detail?: string }[] = (
    s.timeline ?? s.content.map((c) => ({ label: c }))
  ).slice(0, 6);
  const n = Math.max(items.length, 2);
  const lineY = 4.0;
  const startX = M + 0.4;
  const span = W - M * 2 - 0.8;
  const els: LayoutEl[] = [
    txt(M, 0.8, W - M * 2, 1.15, s.title, 30, "textBody", {
      bold: true,
      font: "head",
      lineSpacing: 1.05,
      shrink: true,
    }),
    box(startX, lineY - 0.02, span, 0.045, "neutralTint"),
  ];
  items.forEach((it, i) => {
    const cx = startX + (n === 1 ? span / 2 : (span * i) / (n - 1));
    const above = i % 2 === 0;
    els.push({ kind: "shape", shape: "ellipse", x: cx - 0.14, y: lineY - 0.13, w: 0.28, h: 0.28, fill: "primary", shadow: true });
    els.push({ kind: "shape", shape: "ellipse", x: cx - 0.055, y: lineY - 0.045, w: 0.11, h: 0.11, fill: "white" });
    const labelY = above ? lineY - 1.5 : lineY + 0.42;
    els.push(
      txt(cx - 1.05, labelY, 2.1, 0.5, it.label, 12.5, "textBody", {
        bold: true,
        align: "center",
        valign: above ? "bottom" : "top",
        shrink: true,
        maxLines: 2,
      }),
    );
    if (it.detail) {
      els.push(
        txt(cx - 1.05, above ? labelY + 0.52 : labelY + 0.55, 2.1, 0.65, it.detail, 10, "textMuted", {
          align: "center",
          valign: "top",
          lineSpacing: 1.12,
          shrink: true,
          maxLines: 2,
        }),
      );
    }
  });
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const processSteps: LayoutFn = (s, ctx) => {
  const items: { label: string; detail?: string }[] = (
    s.steps ?? s.content.map((c) => ({ label: c }))
  ).slice(0, 5);
  const n = Math.max(items.length, 2);
  const gap = 0.28;
  const stepW = (W - M * 2 - gap * (n - 1)) / n;
  const top = 2.9;
  const els: LayoutEl[] = [
    txt(M, 0.8, W - M * 2, 1.15, s.title, 30, "textBody", {
      bold: true,
      font: "head",
      lineSpacing: 1.05,
      shrink: true,
    }),
  ];
  items.forEach((st, i) => {
    const x = M + i * (stepW + gap);
    const fill: ColorRole = i % 2 === 0 ? "primary" : "primaryShade";
    els.push({ kind: "shape", shape: "chevron", x, y: top, w: stepW, h: 1.35, fill, shadow: true });
    // Text starts past the chevron's left notch (18% inset at mid-height).
    const tx = x + stepW * 0.26;
    const tw = stepW * 0.62;
    els.push(
      txt(tx, top + 0.18, tw, 0.45, String(i + 1).padStart(2, "0"), 16, "textOnDark", {
        bold: true,
        font: "head",
      }),
    );
    els.push(
      txt(tx, top + 0.62, tw, 0.6, st.label, 11.5, "textOnDark", {
        bold: true,
        valign: "top",
        lineSpacing: 1.05,
        shrink: true,
        maxLines: 2,
      }),
    );
    if (st.detail) {
      els.push(
        txt(x + 0.1, top + 1.6, stepW - 0.2, 1.15, st.detail, 10.5, "textMuted", {
          valign: "top",
          lineSpacing: 1.18,
          shrink: true,
          maxLines: 3,
        }),
      );
    }
  });
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const funnel: LayoutFn = (s, ctx) => {
  const stages: { label: string; value?: string }[] = (
    s.funnel ?? s.content.map((c) => ({ label: c }))
  ).slice(0, 4);
  const n = Math.max(stages.length, 2);
  const top = 2.15;
  const stageH = 1.02;
  const gapY = 0.16;
  const cx = (W - 3.6) / 2 + 0.35; // funnel center, leaving right rail for values
  const fills: ColorRole[] = ["primary", "primaryShade", "dark", "accent"];
  const els: LayoutEl[] = [
    txt(M, 0.8, W - M * 2, 1.15, s.title, 30, "textBody", {
      bold: true,
      font: "head",
      lineSpacing: 1.05,
      shrink: true,
    }),
  ];
  stages.forEach((st, i) => {
    const wI = 6.6 - i * 1.35;
    const x = cx - wI / 2;
    const y = top + i * (stageH + gapY);
    els.push({ kind: "shape", shape: "trapezoid", x, y, w: wI, h: stageH, fill: fills[i % fills.length], flipV: true, shadow: true });
    els.push(
      txt(x + 0.3, y, wI - 0.6, stageH, st.label, 13, "textOnDark", {
        bold: true,
        align: "center",
        valign: "middle",
        shrink: true,
      }),
    );
    if (st.value) {
      els.push(
        txt(cx + 3.65, y + stageH / 2 - 0.26, 2.2, 0.52, st.value, 16, "primary", {
          bold: true,
          font: "head",
          valign: "middle",
        }),
      );
    }
  });
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const swotMatrix: LayoutFn = (s, ctx) => {
  const sw = s.swot ?? { s: s.content.slice(0, 2), w: s.content.slice(2, 4), o: s.content.slice(4, 6), t: s.content.slice(6, 8) };
  const quads: { letter: string; name: string; tint: ColorRole; letterColor: ColorRole; points: string[] }[] = [
    { letter: "S", name: "Strengths", tint: "primaryTint", letterColor: "primary", points: sw.s },
    { letter: "W", name: "Weaknesses", tint: "neutralTint", letterColor: "textMuted", points: sw.w },
    { letter: "O", name: "Opportunities", tint: "accentTint", letterColor: "accent", points: sw.o },
    { letter: "T", name: "Threats", tint: "surfaceAlt", letterColor: "primaryShade", points: sw.t },
  ];
  const top = 1.95;
  const gap = 0.3;
  const qw = (W - M * 2 - gap) / 2;
  const qh = (H - top - 0.75 - gap) / 2;
  const els: LayoutEl[] = [
    txt(M, 0.75, W - M * 2, 1.0, s.title, 30, "textBody", {
      bold: true,
      font: "head",
      shrink: true,
    }),
  ];
  quads.forEach((q, i) => {
    const x = M + (i % 2) * (qw + gap);
    const y = top + Math.floor(i / 2) * (qh + gap);
    els.push(card(x, y, qw, qh, q.tint, { radius: 0.12 }));
    els.push(
      txt(x + qw - 1.15, y + qh - 1.05, 1.0, 1.0, q.letter, 40, q.letterColor, {
        bold: true,
        font: "head",
        align: "right",
        valign: "bottom",
      }),
    );
    els.push(
      txt(x + 0.35, y + 0.22, qw - 1.4, 0.4, q.name, 13, q.letterColor, {
        bold: true,
        font: "head",
        valign: "middle",
      }),
    );
    q.points.slice(0, 3).forEach((pt, pi) => {
      els.push(
        txt(x + 0.35, y + 0.72 + pi * 0.52, qw - 1.35, 0.5, pt, 10.5, "textBody", {
          valign: "top",
          lineSpacing: 1.1,
          shrink: true,
          maxLines: 2,
        }),
      );
    });
  });
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const chartFocus: LayoutFn = (s, ctx) => {
  const bullets = s.content.filter(Boolean).slice(0, 3);
  const chartW = (W - M * 2) * 0.62;
  const els: LayoutEl[] = [
    txt(M, 0.8, W - M * 2, 1.15, s.title, 30, "textBody", {
      bold: true,
      font: "head",
      lineSpacing: 1.05,
      shrink: true,
    }),
  ];
  if (s.chart) {
    els.push(card(M - 0.15, 2.05, chartW + 0.3, 4.55, "neutralTint", { radius: 0.12 }));
    els.push({ kind: "chart", x: M + 0.1, y: 2.3, w: chartW - 0.2, h: 4.05, chart: s.chart });
  }
  const tx = M + chartW + 0.65;
  els.push(
    ...bulletRows(bullets, s.icons, tx, 2.35, W - tx - M, {
      rowH: 1.25,
      size: 12.5,
      max: 3,
    }),
  );
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const teamGrid: LayoutFn = (s, ctx) => {
  const team = (s.team ?? []).slice(0, 4);
  const n = Math.max(team.length, 1);
  const gap = 0.45;
  const cardW = (W - M * 2 - gap * (n - 1)) / n;
  const top = 2.3;
  const cardH = 3.9;
  const els: LayoutEl[] = [
    txt(M, 0.8, W - M * 2, 1.15, s.title, 30, "textBody", {
      bold: true,
      font: "head",
      shrink: true,
    }),
  ];
  team.forEach((m, i) => {
    const x = M + i * (cardW + gap);
    const initials = m.name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    els.push(card(x, top, cardW, cardH, "surfaceAlt", { shadow: true, radius: 0.12 }));
    const avatar = Math.min(cardW - 1.1, 1.3);
    els.push({ kind: "shape", shape: "ellipse", x: x + (cardW - avatar) / 2, y: top + 0.5, w: avatar, h: avatar, fill: "primaryTint" });
    els.push(
      txt(x + (cardW - avatar) / 2, top + 0.5, avatar, avatar, initials, 20, "primary", {
        bold: true,
        font: "head",
        align: "center",
        valign: "middle",
      }),
    );
    els.push(
      txt(x + 0.2, top + 2.1, cardW - 0.4, 0.5, m.name, 14, "textBody", {
        bold: true,
        align: "center",
        valign: "middle",
        shrink: true,
      }),
    );
    els.push(
      txt(x + 0.2, top + 2.62, cardW - 0.4, 0.75, m.role, 11, "textMuted", {
        align: "center",
        valign: "top",
        lineSpacing: 1.15,
        shrink: true,
        maxLines: 2,
      }),
    );
  });
  return { background: "surface", elements: [...els, ...pageFooter(ctx)] };
};

const closingCta: LayoutFn = (s, ctx) => {
  const steps = s.content.filter(Boolean).slice(0, 4);
  const els: LayoutEl[] = [
    brandMark("primaryTint", ctx),
    txt(M, 1.35, W - M * 2 - 1.5, 1.9, s.title, 34, "textOnDark", {
      bold: true,
      font: "head",
      valign: "bottom",
      lineSpacing: 1.05,
      shrink: true,
    }),
  ];
  steps.forEach((st, i) => {
    const y = 3.75 + i * 0.85;
    els.push({ kind: "shape", shape: "ellipse", x: M, y, w: 0.5, h: 0.5, fill: "primary" });
    els.push(
      txt(M, y, 0.5, 0.5, String(i + 1), 14, "textOnDark", {
        bold: true,
        align: "center",
        valign: "middle",
      }),
    );
    els.push(
      txt(M + 0.75, y - 0.03, W - M * 2 - 0.75, 0.62, st, 14, "textOnDarkMuted", {
        valign: "middle",
        lineSpacing: 1.1,
        shrink: true,
        maxLines: 2,
      }),
    );
  });
  return { background: "dark", elements: els };
};

const imageFullBleed: LayoutFn = (s, ctx) => {
  const els: LayoutEl[] = [
    { kind: "image", x: 0, y: 0, w: W, h: H, url: s.imageUrl, query: s.imageQuery, fallback: "dark" },
    box(0, 4.5, W, 3.0, "dark", { transparency: 45 }),
    txt(M, 5.0, W - M * 2, 1.3, s.title, 38, "textOnDark", {
      bold: true,
      font: "head",
      valign: "top",
      lineSpacing: 1.05,
      shrink: true,
      maxLines: 2,
    }),
  ];
  if (s.content[0]) {
    els.push(
      txt(M, 6.35, W - M * 2, 0.6, s.content[0], 18, "textOnDarkMuted", {
        valign: "top",
        lineSpacing: 1.2,
        shrink: true,
        maxLines: 1,
      }),
    );
  }
  return { background: "dark", elements: [...els, ...pageFooter(ctx, true)] };
};

const imageTwoColumn: LayoutFn = (s, ctx) => {
  const urls = [s.imageUrls?.[0] ?? s.imageUrl, s.imageUrls?.[1]];
  const els: LayoutEl[] = [
    { kind: "image", x: 0, y: 0, w: 6.5, h: 6.5, url: urls[0], query: s.imageQuery, fallback: "surfaceAlt" },
    { kind: "image", x: 6.83, y: 0, w: 6.5, h: 6.5, url: urls[1], query: s.imageQuery, fallback: "surfaceAlt" },
    box(0, 6.6, W, 0.9, "dark"),
    txt(0, 6.6, W, 0.9, s.title, 22, "textOnDark", {
      bold: true,
      font: "head",
      align: "center",
      valign: "middle",
      shrink: true,
      maxLines: 1,
    }),
  ];
  return { background: "dark", elements: els };
};

const imageFourGrid: LayoutFn = (s, ctx) => {
  const w = 6.5;
  const h = 3.6;
  const positions = [
    { x: 0, y: 0 },
    { x: 6.6, y: 0 },
    { x: 0, y: 3.7 },
    { x: 6.6, y: 3.7 },
  ];
  const els: LayoutEl[] = [];
  positions.forEach((p, i) => {
    els.push({
      kind: "image",
      x: p.x,
      y: p.y,
      w,
      h,
      url: s.imageUrls?.[i] ?? (i === 0 ? s.imageUrl : undefined),
      query: s.imageQuery,
      fallback: "surfaceAlt",
    });
    const label = s.content[i];
    if (label) {
      els.push(box(p.x, p.y + h - 0.34, w, 0.34, "dark", { transparency: 25 }));
      els.push(
        txt(p.x + 0.15, p.y + h - 0.32, w - 0.3, 0.3, label, 12, "surface", {
          valign: "middle",
          shrink: true,
          maxLines: 1,
        }),
      );
    }
  });
  return { background: "dark", elements: els };
};

const imageShowcase: LayoutFn = (s, ctx) => {
  const leftW = W * 0.55;
  const rightW = W - leftW;
  const rightH = H / 3;
  const els: LayoutEl[] = [
    {
      kind: "image",
      x: 0,
      y: 0,
      w: leftW,
      h: H,
      url: s.imageUrls?.[0] ?? s.imageUrl,
      query: s.imageQuery,
      fallback: "dark",
    },
  ];
  for (let i = 0; i < 3; i++) {
    els.push({
      kind: "image",
      x: leftW,
      y: rightH * i,
      w: rightW,
      h: rightH,
      url: s.imageUrls?.[i + 1],
      query: s.imageQuery,
      fallback: "surfaceAlt",
    });
  }
  els.push(box(0, H - 2.4, leftW, 2.4, "dark", { transparency: 35 }));
  els.push(
    txt(0.5, H - 1.9, leftW - 1.0, 1.4, s.title, 28, "textOnDark", {
      bold: true,
      font: "head",
      valign: "bottom",
      lineSpacing: 1.05,
      shrink: true,
      maxLines: 3,
    }),
  );
  return { background: "dark", elements: els };
};

const LAYOUTS: Record<LayoutId, LayoutFn> = {
  title_hero: titleHero,
  title_split: titleSplit,
  agenda,
  section_divider: sectionDivider,
  content_bullets: contentBullets,
  content_image_right: contentImage("right"),
  content_image_left: contentImage("left"),
  two_column_compare: twoColumnCompare,
  stat_kpi: statKpi,
  timeline_horizontal: timelineHorizontal,
  process_steps: processSteps,
  funnel,
  swot_matrix: swotMatrix,
  chart_focus: chartFocus,
  team_grid: teamGrid,
  closing_cta: closingCta,
  image_full_bleed: imageFullBleed,
  image_two_column: imageTwoColumn,
  image_four_grid: imageFourGrid,
  image_showcase: imageShowcase,
};

export function resolveSlide(slide: Slide, ctx: ResolveCtx): ResolvedSlide {
  const id = resolveLayoutId(slide);
  return LAYOUTS[id](slide, ctx);
}
