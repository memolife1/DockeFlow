import type {
  ChartSpec,
  ChartType,
  FunnelStage,
  LayoutType,
  ProcessStep,
  Slide,
  SlideColumn,
  Stat,
  SwotContent,
  TeamMember,
  TimelineItem,
  Tone,
} from "./types";
import { uid, textOf } from "./utils";

export interface GenerateInput {
  presentationId: string;
  title: string;
  subtitle?: string;
  mode: "topic" | "content";
  audience: string;
  goal: string;
  tone: Tone;
  notes: string;
  language?: string; // e.g. "English", "Arabic", "French", "German", "Russian"
  targetSlideCount?: number;
  userImageUris?: string[]; // user's own photo library, preferred over stock images
  imageSource?: "stock" | "mine" | "none";
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
  stats?: unknown; // Stat[] once normalized
  columns?: unknown; // SlideColumn[] once normalized
  icons?: (string | null)[];
  timeline?: unknown; // TimelineItem[] once normalized
  steps?: unknown; // ProcessStep[] once normalized
  funnel?: unknown; // FunnelStage[] once normalized
  swot?: unknown; // SwotContent once normalized
  team?: unknown; // TeamMember[] once normalized
  imageQuery?: string;
  imageUrl?: string;
  imageQueries?: unknown; // string[] once normalized
  imageUrls?: string[]; // resolved server-side, one per imageQueries entry
  sectionNumber?: number;
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

const SCALE: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9, bn: 1e9 };

// A metric's unit family — used to keep a single chart's values comparable.
// Mixing e.g. a percentage with a dollar amount on one linear axis makes the
// smaller values invisible next to the larger one.
export type MetricUnit = "percent" | "currency" | "plain";

// Find the most meaningful quantity in a clause. Numbers glued to a letter
// (Q1, FY25, H2) are ignored; numbers with a unit ($, %, k/m/b) or a decimal
// are preferred over bare integers.
function parseValue(clause: string): { value: number; unit: MetricUnit } | null {
  const re = /(^|[^A-Za-z0-9.])(\$?)(\d+(?:\.\d+)?)\s?(%|k|m|b|bn)?/gi;
  let best: { value: number; score: number; unit: MetricUnit } | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clause))) {
    const [, , dollar, num, unitRaw] = m;
    const unit = (unitRaw || "").toLowerCase();
    let v = parseFloat(num);
    if (SCALE[unit]) v *= SCALE[unit];
    const meaningful = !!unit || !!dollar || num.includes(".");
    const score = meaningful ? 2 : 1;
    const kind: MetricUnit = unit === "%" ? "percent" : dollar ? "currency" : "plain";
    if (!best || score > best.score) best = { value: v, score, unit: kind };
  }
  return best ? { value: best.value, unit: best.unit } : null;
}

// Short label for a metric clause (drop the number, units, and period token).
function metricLabel(clause: string): string {
  const words = clause
    .replace(/\b(q[1-4]|fy\d{2,4}|h[12]|20\d\d)\b/gi, " ")
    .replace(/\$?\d+(?:\.\d+)?\s?(%|k|m|b|bn|percent)?/gi, " ")
    .replace(
      /\b(up|down|to|of|the|a|is|are|was|were|by|at|in|on|our|per|reached|climbed|grew|fell|rose)\b/gi,
      " ",
    )
    .split(/\s+/)
    .filter((w) => w.length > 1);
  const label = words.slice(0, 3).join(" ").trim();
  return tidy(label || clause).slice(0, 24);
}

export interface Metric {
  label: string;
  value: number;
  unit: MetricUnit;
}

export function extractMetrics(notes: string): Metric[] {
  const out: Metric[] = [];
  for (const c of clauses(notes)) {
    if (!/\d/.test(c)) continue;
    const parsed = parseValue(c);
    if (parsed === null) continue;
    out.push({ label: metricLabel(c), value: parsed.value, unit: parsed.unit });
    if (out.length >= 8) break;
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

// A clause tagged with a time period (Q1, months, years) plus a value —
// labelled by the period so a line chart reads correctly, not by scraped words.
const PERIOD_RE =
  /\b(q[1-4]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|20\d\d)\b/i;

function normalizePeriod(p: string): string {
  const s = p.trim();
  if (/^q[1-4]$/i.test(s)) return s.toUpperCase();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function extractTimeSeries(
  notes: string,
): { labels: string[]; values: number[] } | null {
  const points: { period: string; value: number; unit: MetricUnit }[] = [];
  for (const c of clauses(notes)) {
    const pm = c.match(PERIOD_RE);
    if (!pm) continue;
    const parsed = parseValue(c);
    if (parsed === null) continue;
    points.push({ period: normalizePeriod(pm[1]), value: parsed.value, unit: parsed.unit });
  }
  // Keep the series unit- and magnitude-consistent — the same guard as the
  // bar-chart path (a stray "6-person team" mixed into a revenue trend would
  // otherwise flatten the real series).
  if (points.length >= 2) {
    const byUnit = new Map<MetricUnit, typeof points>();
    for (const p of points) byUnit.set(p.unit, [...(byUnit.get(p.unit) ?? []), p]);
    const sameUnit = [...byUnit.values()].sort((a, b) => b.length - a.length)[0];
    const clustered = tightestMagnitudeCluster(sameUnit);
    if (clustered.length < points.length) points.splice(0, points.length, ...clustered);
  }
  if (points.length < 2) return null;
  return {
    labels: points.map((p) => p.period),
    values: points.map((p) => p.value),
  };
}

// Within a same-unit group, values can still span wildly different magnitudes
// (e.g. "3x", "14 weeks", "280,000") — the largest one still swamps the rest
// on a linear axis. Keep only the largest contiguous cluster (sorted by value)
// where each neighboring step is within MAX_STEP_RATIO of the previous value.
const MAX_STEP_RATIO = 8;
function tightestMagnitudeCluster<T extends { value: number }>(items: T[]): T[] {
  if (items.length < 2) return items;
  const sorted = [...items].sort((a, b) => a.value - b.value);
  let bestStart = 0;
  let bestLen = 1;
  let curStart = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = Math.max(Math.abs(sorted[i - 1].value), 1e-9);
    const ratio = Math.abs(sorted[i].value) / prev;
    if (ratio > MAX_STEP_RATIO) curStart = i;
    const curLen = i - curStart + 1;
    if (curLen > bestLen) {
      bestLen = curLen;
      bestStart = curStart;
    }
  }
  const cluster = new Set(sorted.slice(bestStart, bestStart + bestLen));
  // Preserve the caller's original ordering (matters for time series).
  return items.filter((it) => cluster.has(it));
}

// Build a chart from the data found in the notes, if any.
export function buildChartFromNotes(notes: string): ChartSpec | undefined {
  // Prefer a clean, period-labelled trend when the notes describe one.
  const ts = extractTimeSeries(notes);
  if (ts) {
    return {
      type: "line",
      title: "Trend",
      labels: ts.labels,
      series: [{ name: "Value", values: ts.values }],
    };
  }

  const allMetrics = extractMetrics(notes);
  if (allMetrics.length < 2) return undefined;

  // Chart values must share a unit — a percentage and a dollar figure on the
  // same linear axis makes the smaller one invisible. Use the largest
  // same-unit group found in the notes.
  const byUnit = new Map<MetricUnit, Metric[]>();
  for (const m of allMetrics) byUnit.set(m.unit, [...(byUnit.get(m.unit) ?? []), m]);
  const sameUnit = [...byUnit.values()].sort((a, b) => b.length - a.length)[0];
  const metrics = tightestMagnitudeCluster(sameUnit);
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

// Pull up to 3 distinct headline numbers (preserving their display form, e.g.
// "$4.2M", "38%", "3x") from the notes, for a stat-block slide.
export function extractStats(notes: string): Stat[] {
  const out: Stat[] = [];
  const seenLabels = new Set<string>();
  for (const c of clauses(notes)) {
    const re = /(^|[^A-Za-z0-9.])(\$?\d+(?:\.\d+)?)(%|k|m|b|bn|x)?/gi;
    let m: RegExpExecArray | null;
    let best: { tok: string; score: number } | null = null;
    while ((m = re.exec(c))) {
      const numRaw = m[2];
      const unit = (m[3] || "").toLowerCase();
      const unitDisp = unit === "bn" ? "B" : unit ? unit.toUpperCase() : "";
      const tok = numRaw + unitDisp;
      const meaningful = numRaw.includes("$") || numRaw.includes(".") || !!unit;
      const score = meaningful ? 2 : 1;
      if (!best || score > best.score) best = { tok, score };
    }
    if (!best || best.score < 2) continue; // only clauses with a real stat
    // Descriptive label only — skip bare "period + number" clauses (e.g. "Q2 1.8M").
    const stripped = c
      .replace(/\b(q[1-4]|fy\d{2,4}|h[12]|20\d\d)\b/gi, " ")
      .replace(/\$?\d+(?:\.\d+)?\s?(%|k|m|b|bn|x|percent)?/gi, " ")
      .replace(
        /\b(up|down|to|of|the|a|is|are|was|were|by|at|in|on|our|per|reached|climbed|grew|fell|rose|after|before)\b/gi,
        " ",
      )
      .split(/\s+/)
      .filter((w) => w.length > 1)
      .slice(0, 3)
      .join(" ")
      .trim();
    if (!stripped) continue;
    const label = tidy(stripped).slice(0, 24);
    if (seenLabels.has(label.toLowerCase())) continue;
    seenLabels.add(label.toLowerCase());
    out.push({ value: best.tok, label });
    if (out.length >= 3) break;
  }
  return out;
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
  const useUserPhotos = (input.userImageUris?.length ?? 0) > 0;
  const noImages = input.imageSource === "none";

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
    layoutType: "title_hero",
  });

  // 2) Agenda
  drafts.push({
    title: "What we'll cover",
    content: [
      "Where things stand today",
      "The signal behind the numbers",
      "What it means if we do nothing",
      "The choice in front of us",
      "The recommendation",
      "The plan for the next 90 days",
    ],
    speakerNotes: "Set the shape of the argument up front so the room knows where this is headed.",
    layoutType: "agenda",
  });

  // 3) Context (assertion)
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
    icons: ["target", "growth", "money"],
    speakerNotes:
      "Don't just describe the situation — signal that the comfortable read is wrong. Set up the tension you'll resolve.",
    layoutType: "content_bullets",
  });

  // 3b) Proof in numbers (stat-block) — real stats from notes, else synthesized.
  const noteStats = extractStats(input.notes);
  const stats: Stat[] =
    noteStats.length >= 2
      ? noteStats
      : synth
      ? [
          { value: synth.last, label: `${synth.noun} in Q4` },
          { value: `${synth.growthPct}%`, label: "Growth since Q1" },
          { value: "3", label: "Accounts driving over half of it" },
        ]
      : [];
  if (stats.length >= 2) {
    drafts.push({
      title: `The numbers make the case in three figures`,
      content: [],
      stats,
      speakerNotes:
        "Say each number out loud, then the one sentence it implies. Numbers land harder spoken than read.",
      layoutType: "stat_kpi",
    });
  }

  // 4) Insight — carries the chart when there's data, otherwise a plain
  // assertion slide (kept distinct from the context layout above).
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
    icons: ["trend", "risk", "time"],
    speakerNotes:
      "This is the slide that changes the room's mind. Walk the trend, then land the one number that reframes it. Pause before the recommendation.",
    // Distinct from the context slide above (content_bullets) whether or not
    // a stat_kpi slide separates them, so two content_bullets never land back
    // to back.
    layoutType: chart ? "chart_focus" : noImages ? "content_bullets" : "content_image_left",
    imageQuery:
      chart || noImages ? undefined : useUserPhotos ? "USER_PHOTO" : `${title} business strategy`,
  };
  if (chart) insight.chart = chart;
  drafts.push(insight);

  // 5) Implication (assertion) — image-zone layout for visual variety.
  drafts.push({
    title: `Concentrated growth is a risk dressed up as a win`,
    content: [
      `For ${aud}, the exposure is now the story — not the headline number`,
      "A single churned account erases a quarter of progress",
      "Doing nothing locks in the fragility",
    ],
    icons: ["warning", "person", "lock"],
    imageQuery: noImages ? undefined : useUserPhotos ? "USER_PHOTO" : `${title} team discussion`,
    speakerNotes:
      "Make it personal to the audience's goals. The point is stakes, not analysis — why they can't let this ride.",
    layoutType: noImages
      ? "swot_matrix"
      : insight.layoutType === "content_image_left"
      ? "content_bullets"
      : "content_image_right",
    swot: noImages
      ? {
          s: ["Existing accounts still renewing at a healthy rate"],
          w: ["Growth concentrated in a handful of accounts"],
          o: [`Redirect effort toward ${objective}`],
          t: ["A single churn event resets the year"],
        }
      : undefined,
  });

  // 6) The choice (two-column comparison) — stay vs. act.
  drafts.push({
    title: `The choice is between protecting the number and earning it`,
    content: [],
    columns: [
      {
        heading: "Stay the course",
        points: [
          "Ride the current accounts and hope they renew",
          "Efficiency keeps slipping quarter over quarter",
          "One churn event resets the year",
        ],
      },
      {
        heading: `Make the move`,
        points: [
          `Redirect effort toward ${objective}`,
          "Fix the mid-funnel leak while momentum is high",
          "Broaden the base so no single account is decisive",
        ],
      },
    ],
    speakerNotes:
      "Frame it as a real fork, not a strawman. Give the safe option its due, then show why it's the riskier one.",
    layoutType: "two_column_compare",
  });

  // 7) Recommendation (section divider)
  drafts.push({
    title: `Double down where it's working — and fix the leak now`,
    content: [`The move: ${objective}, starting this quarter`],
    speakerNotes:
      "State the recommendation as one decisive sentence, then stop talking. Let it sit before you defend it.",
    layoutType: "section_divider",
    sectionNumber: 2,
  });

  // 8) The plan (timeline) — the required "visual" layout for variety.
  drafts.push({
    title: `Ninety days, three checkpoints, one owner each`,
    content: [],
    timeline: [
      { label: "Day 1–14", detail: "Name owner, launch the fix" },
      { label: "Day 15–30", detail: "Instrument and review signal" },
      { label: "Day 31–60", detail: "Broaden beyond top accounts" },
      { label: "Day 61–90", detail: "Confirm the trend holds" },
    ],
    speakerNotes:
      "Walk left to right. Each checkpoint needs a name attached before you leave the room.",
    layoutType: "timeline_horizontal",
  });

  // 9) Next steps (closing)
  drafts.push({
    title: `Three moves in the next 30 days, each with an owner`,
    content: [
      "Name a single owner for the concentration risk this week",
      "Launch the mid-funnel fix and instrument it by day 14",
      "Review leading indicators with this group at day 30",
    ],
    speakerNotes:
      "Close by assigning, not suggesting. Say the names and the dates out loud so the commitment is public.",
    layoutType: "closing_cta",
  });

  return drafts;
}

// Adjusts a deck's draft list to match the user's requested slide count
// (4-30, via the wizard's custom option). Trims from the middle (keeping the
// opening and closing slides) or pads with generic evidence slides just
// before the close. Called last (after any safety-net layout insertions) so
// the final slide count is always exact.
export function padOrTrimToTarget(drafts: DraftSlide[], target: number): DraftSlide[] {
  const clamped = Math.max(4, Math.min(30, Math.round(target)));
  if (drafts.length === clamped) return drafts;

  if (drafts.length > clamped) {
    const out = [...drafts];
    while (out.length > clamped) {
      out.splice(Math.max(1, Math.floor(out.length / 2)), 1);
    }
    return out;
  }

  const out = [...drafts];
  const insertBase = Math.max(1, out.length - 1);
  let n = 1;
  while (out.length < clamped) {
    out.splice(insertBase + n - 1, 0, {
      title: `Additional evidence ${n}: a closer look at the case`,
      content: [
        "A concrete example that reinforces the recommendation",
        "Detail worth walking through if the room wants more depth",
      ],
      speakerNotes: "Use this slide only if the discussion calls for another layer of detail.",
      layoutType: "content_bullets",
    });
    n++;
  }
  return out;
}

// ---- Draft -> Slide mapping (shared by fallback and LLM path) ---------------

export function draftsToSlides(
  presentationId: string,
  drafts: DraftSlide[],
): Slide[] {
  return drafts.slice(0, 30).map((d, i) => ({
    id: uid("slide"),
    presentationId,
    orderIndex: i,
    title: d.title,
    content: d.content.filter(Boolean),
    speakerNotes: d.speakerNotes ?? "",
    layoutType: d.layoutType,
    chart: normalizeChart(d.chart),
    stats: normalizeStats(d.stats),
    columns: normalizeColumns(d.columns),
    icons: Array.isArray(d.icons) ? d.icons : undefined,
    timeline: normalizeTimeline(d.timeline),
    steps: normalizeSteps(d.steps),
    funnel: normalizeFunnel(d.funnel),
    swot: normalizeSwot(d.swot),
    team: normalizeTeam(d.team),
    imageQuery: d.imageQuery,
    imageUrl: d.imageUrl,
    imageQueries: Array.isArray(d.imageQueries)
      ? d.imageQueries.map(String).filter(Boolean).slice(0, 4)
      : undefined,
    imageUrls: d.imageUrls,
    sectionNumber: d.sectionNumber,
  }));
}

function str(v: unknown): string {
  return v != null ? String(v).trim() : "";
}

export function normalizeTimeline(v: unknown): TimelineItem[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v
    .map((x) => {
      const o = x as Partial<TimelineItem>;
      return { label: str(o?.label), detail: o?.detail ? str(o.detail) : undefined };
    })
    .filter((x) => x.label)
    .slice(0, 6);
  return out.length >= 2 ? out : undefined;
}

export function normalizeSteps(v: unknown): ProcessStep[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v
    .map((x) => {
      const o = x as Partial<ProcessStep>;
      return { label: str(o?.label), detail: o?.detail ? str(o.detail) : undefined };
    })
    .filter((x) => x.label)
    .slice(0, 5);
  return out.length >= 2 ? out : undefined;
}

export function normalizeFunnel(v: unknown): FunnelStage[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v
    .map((x) => {
      const o = x as Partial<FunnelStage>;
      return { label: str(o?.label), value: o?.value ? str(o.value) : undefined };
    })
    .filter((x) => x.label)
    .slice(0, 4);
  return out.length >= 2 ? out : undefined;
}

export function normalizeSwot(v: unknown): SwotContent | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Partial<SwotContent>;
  const arr = (x: unknown) =>
    Array.isArray(x) ? x.map(String).filter(Boolean).slice(0, 3) : [];
  const out: SwotContent = {
    s: arr(o.s),
    w: arr(o.w),
    o: arr(o.o),
    t: arr(o.t),
  };
  const hasAny = out.s.length || out.w.length || out.o.length || out.t.length;
  return hasAny ? out : undefined;
}

export function normalizeTeam(v: unknown): TeamMember[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v
    .map((x) => {
      const o = x as Partial<TeamMember>;
      return { name: str(o?.name), role: str(o?.role) };
    })
    .filter((x) => x.name)
    .slice(0, 4);
  return out.length ? out : undefined;
}

// Defensive normalization for stat-block data (raw from the model or engine).
export function normalizeStats(stats: unknown): Stat[] | undefined {
  if (!Array.isArray(stats)) return undefined;
  const out = stats
    .map((s) => {
      const o = s as Partial<Stat>;
      const value = o?.value != null ? String(o.value).trim() : "";
      const label = o?.label != null ? String(o.label).trim() : "";
      return { value, label };
    })
    .filter((s) => s.value)
    .slice(0, 4);
  return out.length ? out : undefined;
}

// Defensive normalization for two-column comparison data.
export function normalizeColumns(columns: unknown): SlideColumn[] | undefined {
  if (!Array.isArray(columns)) return undefined;
  const out = columns
    .map((c) => {
      const o = c as Partial<SlideColumn>;
      return {
        heading: o?.heading != null ? String(o.heading).trim() : "",
        points: Array.isArray(o?.points)
          ? o.points.map(textOf).filter(Boolean).slice(0, 5)
          : [],
      };
    })
    .filter((c) => c.heading || c.points.length)
    .slice(0, 2);
  return out.length >= 2 ? out : undefined;
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
