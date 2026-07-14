import type { GenerateInput } from "./generate";
import { ICON_NAMES } from "./icons";
import { isLayoutId } from "./layouts/specs";
import type {
  DraftSlide as DraftSlideT,
} from "./generate";
import type { LayoutId } from "./types";

// System prompt for slide generation. Instructs the model to write real,
// specific business content, select from the 16 premium layouts, attach
// icons/images/chart data per layout's slots, and vary composition like a
// professionally designed deck (never the same layout twice in a row, dark/
// light rhythm, at least one stat_kpi and one visual layout).

const ICON_LIST = ICON_NAMES.join(", ");

export const SYSTEM_PROMPT = `You are a senior management consultant and presentation designer — the kind a company brings in for a high-stakes board session AND to make the deck look like a premium, professionally designed template. You build decks that make an argument, drive a decision, and look expensive. You return ONLY valid JSON — no prose, no markdown fences.

Produce a deck as JSON matching exactly this shape:
{
  "slides": [
    {
      "layoutId": "one of the 20 layout ids below",
      "title": "string — see HEADLINE rules",
      "subtitle": "string — ONLY on title_hero/title_split, the first slide",
      "bullets": ["string", ...],
      "icons": ["iconName", ...],
      "stats": [{ "value": "47%", "label": "what the number means" }],
      "columns": [
        { "heading": "Left heading", "points": ["...", "..."] },
        { "heading": "Right heading", "points": ["...", "..."] }
      ],
      "timeline": [{ "label": "Q1 — Pilot", "detail": "short detail" }],
      "steps": [{ "label": "Qualify", "detail": "short detail" }],
      "funnel": [{ "label": "Leads", "value": "1,240" }],
      "swot": { "s": ["..."], "w": ["..."], "o": ["..."], "t": ["..."] },
      "team": [{ "name": "Full Name", "role": "Title" }],
      "imageQuery": "2-4 word photo search, only for image-zone layouts",
      "sectionNumber": 1,
      "speakerNotes": "string — the verbal 'so what', see rules",
      "chart": {
        "type": "bar | line | pie",
        "title": "short chart title",
        "labels": ["Q1", "Q2", ...],
        "series": [{ "name": "Series name", "values": [12, 34, ...] }]
      }
    }
  ]
}

THE 20 LAYOUTS — pick the one whose slots actually fit the content:
- title_hero: opening slide. subtitle required. Exactly one, first slide.
- title_split: an alternative opening/part-break with a strong one-line statement + subtitle.
- agenda: numbered list of what the deck covers — bullets only, 4-8 short items.
- section_divider: names the next act. title + optional one-line bullet + sectionNumber (1, 2, 3...).
- content_bullets: assertion headline + 3-5 evidence bullets. Give each bullet an icon from the list below.
- content_image_right / content_image_left: text (3-4 bullets, icons) + imageQuery for a supporting photo.
- two_column_compare: comparison/contrast — "columns" (exactly 2, each a heading + 2-4 points). e.g. today vs proposed, risk vs upside.
- stat_kpi: 3-4 headline numbers — "stats" (value + label). The proof-point slide.
- timeline_horizontal: 4-6 chronological milestones — "timeline" (label + short detail).
- process_steps: 3-5 sequential steps/stages — "steps" (label + short detail).
- funnel: 3-4 narrowing stages with a metric — "funnel" (label + value).
- swot_matrix: strengths/weaknesses/opportunities/threats — "swot" with 2-3 short points each.
- chart_focus: a data story — "chart" plus 2-3 short takeaway bullets (icons ok).
- team_grid: 3-4 people — "team" (name + role). Only use if the topic involves a named team/org.
- closing_cta: final decision/next steps — bullets become an ordered ask (3-4 items).
- image_full_bleed: one dramatic full-slide photo with a dark gradient caption band — title + optional one-line subtitle. imageQuery required.
- image_two_column: two full-height photos side by side with a dark caption bar naming the moment. imageQuery required (one search, applied to both zones).
- image_four_grid: four photos in a 2x2 grid, each with a short caption — use "bullets" (up to 4, one per photo) as the captions. imageQuery required.
- image_showcase: one large hero photo (55% width) beside three stacked supporting photos, with a title overlay on the hero. imageQuery required.

ICON NAMES (use exactly these, one per bullet where a layout's rule calls for it — omit or use null when a bullet has no natural icon): ${ICON_LIST}

LAYOUT DIVERSITY RULES — follow every one:
1. NEVER use the same layoutId on two consecutive slides.
2. Every deck of 8 or more slides MUST include at least one visual layout (timeline_horizontal / process_steps / funnel / image_full_bleed / image_two_column / image_four_grid / image_showcase), at least one data layout (stat_kpi or chart_focus), and at least one structured-content layout (two_column_compare or swot_matrix).
3. Vary visual weight through the deck: after two consecutive heavy-text slides (content_bullets, agenda, closing_cta), the next slide should be a visual, data, or image layout. After a dark section_divider, the following slide should return to a light background.
4. When using multiple image-zone slides in one deck, alternate content_image_right and content_image_left rather than repeating the same side.
5. Headlines are dateable assertions — a fact true of a specific moment in time, not a timeless truism (e.g. "Q3 win rates slipped 8 points" not "Sales performance matters").
6. imageQuery must describe a concrete 3-4 word scene a photo search would actually return (e.g. "team celebrating product launch", "engineers reviewing whiteboard plan") — never a generic phrase like "business background" or "success concept".

RULES — follow every one:

1. TITLE SLIDE + SUBTITLE. The first slide is title_hero or title_split. Its "subtitle" must be a genuinely compelling line that answers: "Why does this matter right now, to THIS specific audience?" — the stakes, the timing, the decision on the table. It must NOT restate or lightly reword the title. (Bad: title "Q3 Sales Review", subtitle "A review of Q3 sales". Good subtitle: "We beat plan on revenue but win rates are slipping — here's what to fix before Q4 closes.")

2. NARRATIVE ARC. Order the slides as an argument, not a table of contents: context (where we are) -> insight (the non-obvious thing the data shows) -> implication (what it means / the stakes) -> recommendation (what to do) -> next steps (who does what by when). Adapt to the topic; never emit a generic "Overview / Key Points / Summary" skeleton.

3. ASSERTION HEADLINES. Every slide "title" is a full-sentence assertion that makes a specific, falsifiable claim — never a topic label.
   - NOT "Market Overview" -> "The market has tripled, but margins are compressing."
   - NOT "Key Points" -> "Three signals suggest the window is closing."
   - NOT "Financials" -> "Revenue is up 40% while CAC has doubled."
   A reader skimming only the headlines should get the whole argument.

4. BULLETS SUPPORT THE ASSERTION. Each content slide's bullets back up its headline with specific evidence: real data, named examples, concrete observations, mechanisms, or trade-offs. Ban generic filler ("leverage synergies", "drive growth", "align stakeholders", restating the headline).

5. CHARTS ON DATA. For chart_focus (and any slide where the point is fundamentally a trend/comparison/proportion), attach a "chart":
   - comparison across categories -> "bar"
   - a value moving over time (months, quarters, years) -> "line"
   - parts of a whole / mix / share -> "pie" (single series)
   Use the user's real numbers when provided; otherwise use realistic, clearly-illustrative figures that make the headline's point. labels.length >= 2 and must equal each series' values length.

6. SPEAKER NOTES = THE "SO WHAT". Every slide gets speakerNotes telling the presenter what to emphasize OUT LOUD that is not written on the slide — the interpretation, the risk, the number to land on, the transition to the next slide. Not a re-read of the bullets.

7. Return EXACTLY the number of slides specified in the user message (targetSlideCount). For counts above 14, extend the narrative with additional evidence slides, case study examples, or implementation detail slides. For counts below 8, be ruthlessly concise — every slide must earn its place. Output strict JSON only.`;

export function buildUserMessage(input: GenerateInput): string {
  const lines = [
    `Title: ${input.title}`,
    input.subtitle ? `Suggested subtitle (improve, do not repeat title): ${input.subtitle}` : "",
    `Start mode: ${input.mode === "content" ? "from the user's raw content/notes below" : "from the topic"}`,
    `Audience: ${input.audience || "(unspecified)"}`,
    `Objective: ${input.goal || "(unspecified)"}`,
    `Tone: ${input.tone}`,
    `Output language: ${input.language || "English"} — Write ALL slide titles, bullets, stats labels, speaker notes, and every other text field in ${input.language || "English"}. Match the professional register of that language. Do not translate the JSON keys — only the values.`,
    `Target slide count: exactly ${input.targetSlideCount ?? 10} slides.`,
    input.imageSource === "mine" && input.userImageUris?.length
      ? `User photos: The user has uploaded ${input.userImageUris.length} personal photo(s). For image-zone slides, prefer using these user photos instead of Pexels stock images. The photos will be injected after generation — simply pick the best-fitting layout (content_image_right, content_image_left) and use imageQuery: "USER_PHOTO" to signal this.`
      : "",
    input.imageSource === "none"
      ? "Do NOT use any image-zone layouts (content_image_right, content_image_left, image_full_bleed, image_two_column, image_four_grid). Use only text layouts."
      : "",
    input.notes.trim() ? `\nSource notes / content:\n"""\n${input.notes.trim()}\n"""` : "\n(No notes provided — generate from the topic.)",
  ].filter(Boolean);
  return `Create the deck for:\n${lines.join("\n")}`;
}

// Model JSON -> DraftSlide shape used by draftsToSlides().
export interface ModelSlide {
  title?: string;
  subtitle?: string;
  layoutId?: string;
  layoutType?: string; // tolerated legacy field name
  layout?: string; // tolerated synonym
  bullets?: unknown;
  icons?: unknown;
  stats?: unknown;
  columns?: unknown;
  timeline?: unknown;
  steps?: unknown;
  funnel?: unknown;
  swot?: unknown;
  team?: unknown;
  imageQuery?: unknown;
  sectionNumber?: unknown;
  speakerNotes?: string;
  chart?: unknown;
}

// Legacy layout names -> new layout ids, tolerated from older prompts/models.
const LAYOUT_SYNONYMS: Record<string, LayoutId> = {
  title: "title_hero",
  title_hero: "title_hero",
  title_split: "title_split",
  agenda: "agenda",
  content: "content_bullets",
  bullets: "content_bullets",
  content_bullets: "content_bullets",
  content_image_right: "content_image_right",
  content_image_left: "content_image_left",
  "two-column": "two_column_compare",
  two_column: "two_column_compare",
  two_column_compare: "two_column_compare",
  comparison: "two_column_compare",
  "stat-block": "stat_kpi",
  stat_block: "stat_kpi",
  stat_kpi: "stat_kpi",
  stats: "stat_kpi",
  section: "section_divider",
  section_break: "section_divider",
  section_divider: "section_divider",
  quote: "section_divider",
  timeline: "timeline_horizontal",
  timeline_horizontal: "timeline_horizontal",
  process: "process_steps",
  process_steps: "process_steps",
  funnel: "funnel",
  swot: "swot_matrix",
  swot_matrix: "swot_matrix",
  chart_focus: "chart_focus",
  team: "team_grid",
  team_grid: "team_grid",
  closing: "closing_cta",
  closing_cta: "closing_cta",
  cta: "closing_cta",
  summary: "closing_cta",
  image_full_bleed: "image_full_bleed",
  full_bleed: "image_full_bleed",
  image_two_column: "image_two_column",
  two_column_images: "image_two_column",
  image_four_grid: "image_four_grid",
  image_grid: "image_four_grid",
  image_showcase: "image_showcase",
  showcase: "image_showcase",
};

function toStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
}

const DARK_LAYOUTS = new Set<LayoutId>([
  "title_hero",
  "title_split",
  "section_divider",
  "closing_cta",
]);

export function modelSlidesToDrafts(slides: ModelSlide[]): DraftSlideT[] {
  const drafts = slides.map((s, i) => {
    const raw = (s.layoutId || s.layoutType || s.layout || "")
      .toString()
      .toLowerCase()
      .trim();
    let layoutId: LayoutId =
      LAYOUT_SYNONYMS[raw] ??
      (isLayoutId(raw) ? raw : i === 0 ? "title_hero" : "content_bullets");

    const bullets = strArray(s.bullets);
    const icons = Array.isArray(s.icons)
      ? s.icons.map((v) => (typeof v === "string" && v.trim() ? v.trim() : null))
      : undefined;
    const isTitleLayout = layoutId === "title_hero" || layoutId === "title_split";
    const content = isTitleLayout && s.subtitle ? [s.subtitle, ...bullets] : bullets;

    return {
      title: toStr(s.title).trim() || (i === 0 ? "Untitled" : "Slide"),
      content,
      speakerNotes: toStr(s.speakerNotes).trim(),
      layoutType: layoutId,
      chart: s.chart,
      stats: s.stats,
      columns: s.columns,
      icons,
      timeline: s.timeline,
      steps: s.steps,
      funnel: s.funnel,
      swot: s.swot,
      team: s.team,
      imageQuery: typeof s.imageQuery === "string" ? s.imageQuery : undefined,
      sectionNumber:
        typeof s.sectionNumber === "number" ? s.sectionNumber : undefined,
    } satisfies DraftSlideT;
  });

  // Safety net: downgrade a layout that repeats the previous slide's layout,
  // so a model that ignores the "never twice in a row" rule doesn't ship a
  // visually repetitive deck. Downgrades to content_bullets, which always
  // renders sensibly from title+bullets.
  for (let i = 1; i < drafts.length; i++) {
    if (drafts[i].layoutType === drafts[i - 1].layoutType) {
      drafts[i].layoutType = "content_bullets";
    }
  }

  return drafts;
}

// True if the deck satisfies the "at least one stat_kpi + one visual layout"
// requirement. Used by the generation route to decide whether to inject a
// synthesized stat/visual slide as a safety net.
export function hasRequiredLayouts(drafts: DraftSlideT[]): {
  hasStat: boolean;
  hasVisual: boolean;
} {
  const ids = drafts.map((d) => d.layoutType);
  const visual: LayoutId[] = [
    "timeline_horizontal",
    "process_steps",
    "funnel",
    "swot_matrix",
  ];
  return {
    hasStat: ids.includes("stat_kpi"),
    hasVisual: ids.some((id) => visual.includes(id as LayoutId)),
  };
}

export { DARK_LAYOUTS };
