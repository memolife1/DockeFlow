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

// ---- Compelling "why now" subtitle (never repeats the title) ---------------

export function buildSubtitle(input: GenerateInput): string {
  const provided = input.subtitle?.trim();
  if (provided && provided.toLowerCase() !== input.title.trim().toLowerCase()) {
    return provided;
  }
  const aud = input.audience.trim() || "this room";
  const goal = input.goal.trim();
  if (goal) {
    const g = goal.charAt(0).toUpperCase() + goal.slice(1);
    return `${g} — and why ${aud} can't afford to wait past this quarter.`;
  }
  return `What the numbers mean for ${aud}, and why the decision can't wait.`;
}

// ---- Illustrative data synthesis (data-oriented topics without notes) -------

const DATA_TOPIC =
  /\b(sales|revenue|bookings|pipeline|growth|performance|review|quarter|q[1-4]|results|metrics|arr|mrr|churn|retention|funnel|conversion|market|forecast|budget|kpi|financ)/i;

function isDataTopic(input: GenerateInput): boolean {
  return DATA_TOPIC.test(`${input.title} ${input.goal} ${input.notes}`);
}

function seedOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function metricNoun(input: GenerateInput): string {
  const t = `${input.title} ${input.goal}`.toLowerCase();
  if (/user|signup|active|seat|account/.test(t)) return "Active accounts";
  if (/pipeline|deal|win/.test(t)) return "Pipeline";
  if (/sales|revenue|booking|arr|mrr|financ/.test(t)) return "Bookings";
  return "Performance";
}

interface Synth {
  chart: ChartSpec;
  noun: string;
  last: string;
  growthPct: number;
}

// Build a coherent, clearly-illustrative quarterly trend for a data topic.
function synthesize(input: GenerateInput): Synth {
  const seed = seedOf(input.title);
  const noun = metricNoun(input);
  const base = 1.6 + (seed % 8) * 0.1; // 1.6 – 2.3 ($M)
  const raw = [base, base + 0.3, base + 0.2, base + 0.7].map(
    (v) => Math.round(v * 10) / 10,
  );
  const growthPct = Math.round(((raw[3] - raw[0]) / raw[0]) * 100);
  return {
    chart: {
      type: "line",
      title: `${noun} by quarter ($M)`,
      labels: ["Q1", "Q2", "Q3", "Q4"],
      series: [{ name: noun, values: raw }],
    },
    noun,
    last: `$${raw[3].toFixed(1)}M`,
    growthPct,
  };
}

// ---- Deterministic deck engine (fallback when no LLM key) -------------------
// Mirrors the system prompt: assertion headlines, a context -> insight ->
// implication -> recommendation -> next-steps arc, specific bullets, a native
// chart on the data slide, and "so what" speaker notes.

export function buildDeckDrafts(input: GenerateInput): DraftSlide[] {
  const { title, audience, goal } = input;
  const aud = audience.trim() || "the leadership team";
  const objective = goal.trim() || "commit to the plan";
  const points = input.notes.trim() ? clauses(input.notes).map(tidy) : [];
  const has = points.length > 0;

  // Prefer real data from notes; else synthesize for data topics.
  const notesChart = buildChartFromNotes(input.notes);
  const synth = !notesChart && isDataTopic(input) ? synthesize(input) : null;
  const chart = notesChart ?? synth?.chart;

  const drafts: DraftSlide[] = [];

  // 1) Title + compelling subtitle
  drafts.push({
    title,
    content: [buildSubtitle(input)],
    speakerNotes: `Land the stakes in one breath: this is a decision, not an update. Look at ${aud} and name what's at risk if we wait.`,
    layoutType: "title",
  });

  // 2) Context (assertion)
  drafts.push({
    title: synth
      ? `We enter the review ahead on volume, but behind on efficiency`
      : `The ground has shifted under ${title.toLowerCase()} — and the old plan assumes it hasn't`,
    content: has
      ? points.slice(0, 3)
      : synth
      ? [
          `${synth.noun} grew ${synth.growthPct}% since Q1, so the top line looks healthy`,
          "But the gains came from a handful of accounts, not the base",
          "Cost to win has crept up quarter over quarter",
        ]
      : [
          `${aud} is being asked to decide without a shared baseline`,
          "Effort is spread across competing priorities with no clear owner",
          "The cost of another quarter of drift is now material",
        ],
    speakerNotes:
      "Don't just describe the situation — signal that the comfortable read is wrong. Set up the tension you'll resolve.",
    layoutType: "content",
  });

  // 3) Insight (assertion) — carries the chart when there's data
  const insight: DraftSlide = {
    title: synth
      ? `${synth.noun} climbed ${synth.growthPct}% to ${synth.last} — but the growth is concentrated`
      : has
      ? `The data points one way, and it isn't the obvious one`
      : `Three signals suggest the window is closing faster than it looks`,
    content: has
      ? points.slice(3, 6)
      : synth
      ? [
          `Q4 ${synth.noun.toLowerCase()} reached ${synth.last}, the strongest quarter of the year`,
          "Top three accounts drove over half of net-new",
          "Remove them and underlying growth is roughly flat",
        ]
      : [
          "Momentum is real but it's borrowed from a shrinking pool",
          "The leading indicators turned before the lagging ones did",
          "Waiting one more quarter halves our options",
        ],
    speakerNotes:
      "This is the slide that changes the room's mind. Walk the trend, then land the one number that reframes it. Pause before the recommendation.",
    layoutType: "content",
  };
  if (chart) insight.chart = chart;
  drafts.push(insight);

  // 4) Implication (assertion)
  drafts.push({
    title: `Concentrated growth is a risk dressed up as a win`,
    content: [
      `For ${aud}, the exposure is now the story — not the headline number`,
      "A single churned account erases a quarter of progress",
      "Doing nothing locks in the fragility",
    ],
    speakerNotes:
      "Make it personal to the audience's goals. The point is stakes, not analysis — why they can't let this ride.",
    layoutType: "content",
  });

  // 5) Recommendation (section)
  drafts.push({
    title: `Double down where it's working — and fix the leak now`,
    content: [`The move: ${objective}, starting this quarter`],
    speakerNotes:
      "State the recommendation as one decisive sentence, then stop talking. Let it sit before you defend it.",
    layoutType: "section",
  });

  // 6) Next steps (closing)
  drafts.push({
    title: `Three moves in the next 30 days, each with an owner`,
    content: [
      "Name a single owner for the concentration risk this week",
      "Launch the mid-funnel fix and instrument it by day 14",
      "Review leading indicators with this group at day 30",
    ],
    speakerNotes:
      "Close by assigning, not suggesting. Say the names and the dates out loud so the commitment is public.",
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
