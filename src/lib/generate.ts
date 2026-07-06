import type { ChartSpec, ChartType, LayoutType, Slide, Tone } from "./types";
import { uid } from "./utils";

export interface GenerateInput {
  presentationId: string;
  title: string;
  subtitle?: string;
  mode: "topic" | "content";
  audience: string;
  goal: string;
  tone: Tone;
  notes: string;
}

// Shape a single slide can take, before it's given ids/order. `chart` is left
// loosely typed because it may arrive raw from the model; draftsToSlides()
// normalizes it into a valid ChartSpec (or drops it).
export interface DraftSlide {
  title: string;
  content: string[];
  speakerNotes: string;
  layoutType: LayoutType;
  chart?: ChartSpec | unknown;
}

// ---- Text helpers ----------------------------------------------------------

function clauses(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/\n|(?<=[.!?])\s+|•|;/)
    .map((s) => s.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((s) => s.length > 3);
}

function tidy(s: string): string {
  const clean = s.replace(/\s+/g, " ").trim().replace(/[.]+$/, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// ---- Data extraction (drives real charts) ----------------------------------

const SCALE: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 };

// Parse the first quantity in a clause into a comparable number.
function parseValue(clause: string): number | null {
  const m = clause.match(/\$?\s?(\d+(?:\.\d+)?)\s?(%|k|m|b|bn)?/i);
  if (!m) return null;
  let v = parseFloat(m[1]);
  const unit = (m[2] || "").toLowerCase();
  if (unit === "bn") v *= SCALE.b;
  else if (unit && SCALE[unit]) v *= SCALE[unit];
  return v;
}

// Short label for a metric clause (words around the number).
function metricLabel(clause: string): string {
  const words = clause
    .replace(/\$?\d+(?:\.\d+)?\s?(%|k|m|b|bn|percent)?/gi, " ")
    .replace(/\b(up|down|to|of|the|a|is|are|was|were|by|at|in|on|our|per)\b/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
  const label = words.slice(0, 3).join(" ").trim();
  return tidy(label || clause).slice(0, 22);
}

export interface Metric {
  label: string;
  value: number;
}

export function extractMetrics(notes: string): Metric[] {
  const out: Metric[] = [];
  for (const c of clauses(notes)) {
    if (!/\d/.test(c)) continue;
    const value = parseValue(c);
    if (value === null) continue;
    out.push({ label: metricLabel(c), value });
    if (out.length >= 6) break;
  }
  return out;
}

// A label reads as a time period (month, quarter, year, weekday).
const TIME_LABEL =
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|fy\d|20\d\d|mon|tue|wed|thu|fri|week\s?\d|day\s?\d)\b/i;
const PROPORTION_HINT =
  /\b(share|split|mix|proportion|breakdown|% of|percent of|of total|composition|allocation)\b/i;

// Line only when the category labels themselves are a time sequence; pie when
// the notes describe parts of a whole; otherwise a comparison bar chart.
function pickChartType(notes: string, labels: string[]): ChartType {
  if (PROPORTION_HINT.test(notes)) return "pie";
  const temporal = labels.filter((l) => TIME_LABEL.test(l)).length;
  if (temporal >= Math.ceil(labels.length / 2)) return "line";
  return "bar";
}

// Build a chart from the data found in the notes, if any.
export function buildChartFromNotes(notes: string): ChartSpec | undefined {
  const metrics = extractMetrics(notes);
  if (metrics.length < 2) return undefined;

  const labels = metrics.map((m) => m.label);
  const values = metrics.map((m) => m.value);
  const type = pickChartType(notes, labels);

  if (type === "pie") {
    return { type, title: "Breakdown", labels, series: [{ name: "Share", values }] };
  }
  return {
    type,
    title: type === "line" ? "Trend" : "Key metrics",
    labels,
    series: [{ name: "Value", values }],
  };
}

// ---- Subtitle framing (never repeats the title) ----------------------------

const TONE_FRAME: Record<Tone, string> = {
  professional: "A working briefing",
  confident: "The case",
  consultative: "A structured read",
  friendly: "A quick walkthrough",
  visionary: "The direction ahead",
};

export function buildSubtitle(input: GenerateInput): string {
  const provided = input.subtitle?.trim();
  if (provided && provided.toLowerCase() !== input.title.trim().toLowerCase()) {
    return provided;
  }
  const aud = input.audience.trim();
  const goal = input.goal.trim();
  if (aud && goal) return `${TONE_FRAME[input.tone]} for ${aud} — ${goal}`;
  if (aud) return `${TONE_FRAME[input.tone]} prepared for ${aud}`;
  if (goal) return `${TONE_FRAME[input.tone]}: ${goal}`;
  return `${TONE_FRAME[input.tone]} on the path forward`;
}

// ---- Deterministic deck engine (fallback when no LLM key) -------------------
// Produces contextual subtitles, specific bullets pulled from the input, and a
// native chart when the notes contain data. Mirrors what the LLM prompt asks
// for so the app behaves consistently with or without an API key.

export function buildDeckDrafts(input: GenerateInput): DraftSlide[] {
  const { title, audience, goal, tone, notes, mode } = input;
  const aud = audience.trim() || "the room";
  const objective = goal.trim() || "align on the path forward";
  const points = notes.trim() ? clauses(notes).map(tidy) : [];
  const has = points.length > 0;
  const chart = buildChartFromNotes(notes);

  const drafts: DraftSlide[] = [];

  drafts.push({
    title,
    content: [buildSubtitle(input)],
    speakerNotes: `Open by naming the decision on the table for ${aud}. One sentence, then move.`,
    layoutType: "title",
  });

  drafts.push({
    title: "What we'll cover",
    content: [
      "Where things stand today",
      mode === "content" ? "What the material tells us" : "The opportunity in focus",
      chart ? "The numbers behind it" : "What it means for you",
      `Recommendation: ${objective}`,
      "Next steps and owners",
    ],
    speakerNotes: "Preview the arc: situation, evidence, recommendation, ask.",
    layoutType: "agenda",
  });

  drafts.push({
    title: "Where things stand",
    content: has
      ? points.slice(0, 3)
      : [
          `${aud} is deciding on ${title.toLowerCase()} without a shared baseline`,
          "Effort is spread thin across competing priorities",
          "Every week of delay compounds the cost",
        ],
    speakerNotes: "Ground the room in today's reality before proposing anything.",
    layoutType: "content",
  });

  // Evidence / key-points slide — carries the chart when data is present.
  const evidence: DraftSlide = {
    title: chart
      ? "The numbers"
      : mode === "content"
      ? "Key points"
      : "The opportunity",
    content: has
      ? points.slice(3, 6)
      : [
          `Demand for ${title.toLowerCase()} is concrete and reachable now`,
          "A focused team can move faster than the current baseline",
          "Early signals point to a model we can repeat",
        ],
    speakerNotes: chart
      ? "Walk the chart left to right. Land the single number that matters most."
      : "Spend the most time here — everything downstream rests on these points.",
    layoutType: chart ? "content" : "two-column",
  };
  if (chart) evidence.chart = chart;
  drafts.push(evidence);

  drafts.push({
    title: "What this means",
    content: [
      `For ${aud}, this is a clearer, faster path to ${objective}`,
      "Concentrate effort where it compounds",
      "Cut the moving parts that slow decisions",
    ],
    speakerNotes: "Translate evidence into consequences the audience cares about.",
    layoutType: "content",
  });

  drafts.push({
    title: "Recommendation",
    content: [
      `Commit now to ${objective}`,
      has ? `Lead with: ${points[0]}` : "Start with the highest-leverage move",
      "Set a measurable checkpoint at 30 days",
    ],
    speakerNotes: "State the recommendation in one line, then support it. Be direct.",
    layoutType: "section",
  });

  drafts.push({
    title: "Next steps",
    content: [
      "Confirm scope and a single owner this week",
      "Kick off the first workstream",
      "Review progress at the 30-day mark",
    ],
    speakerNotes: "End with a concrete ask: name the owner and the date.",
    layoutType: "closing",
  });

  return drafts;
}

// ---- Draft -> Slide mapping (shared by fallback and LLM path) ---------------

export function draftsToSlides(
  presentationId: string,
  drafts: DraftSlide[],
): Slide[] {
  return drafts.slice(0, 10).map((d, i) => ({
    id: uid("slide"),
    presentationId,
    orderIndex: i,
    title: d.title,
    content: d.content.filter(Boolean),
    speakerNotes: d.speakerNotes ?? "",
    layoutType: d.layoutType,
    chart: normalizeChart(d.chart),
  }));
}

// Defensive normalization so bad LLM chart JSON never crashes the renderer.
export function normalizeChart(chart: unknown): ChartSpec | undefined {
  if (!chart || typeof chart !== "object") return undefined;
  const c = chart as Partial<ChartSpec>;
  const type: ChartType =
    c.type === "line" || c.type === "pie" ? c.type : "bar";
  const labels = Array.isArray(c.labels)
    ? c.labels.map(String).slice(0, 8)
    : [];
  const rawSeries = Array.isArray(c.series) ? c.series : [];
  const series = rawSeries
    .map((s) => ({
      name: typeof s?.name === "string" && s.name ? s.name : "Value",
      values: Array.isArray(s?.values)
        ? s.values.map((v) => Number(v)).filter((v) => Number.isFinite(v))
        : [],
    }))
    .filter((s) => s.values.length > 0);
  if (labels.length < 2 || series.length === 0) return undefined;
  // Trim every series to the label count.
  series.forEach((s) => (s.values = s.values.slice(0, labels.length)));
  return {
    type,
    title: typeof c.title === "string" ? c.title : undefined,
    labels,
    series,
  };
}

export function buildDeck(input: GenerateInput): Slide[] {
  return draftsToSlides(input.presentationId, buildDeckDrafts(input));
}
