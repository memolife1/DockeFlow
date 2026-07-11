import type { GenerateInput } from "./generate";
import type { LayoutType } from "./types";

// System prompt for slide generation. Instructs the model to write real,
// specific business content, never repeat the title in the subtitle, and to
// detect data and return chart specs (labels + values) for those slides.
export const SYSTEM_PROMPT = `You are a senior management consultant and presentation strategist — the kind a company brings in for a high-stakes board or executive session. You build decks that make an argument and drive a decision. You return ONLY valid JSON — no prose, no markdown fences.

Produce a deck of 6–9 slides as JSON matching exactly this shape:
{
  "slides": [
    {
      "title": "string — see HEADLINE rules",
      "subtitle": "string — ONLY on the first (title) slide",
      "layoutType": "title | content | two-column | stat-block | section | closing",
      "bullets": ["string", ...],
      "stats": [{ "value": "47%", "label": "what the number means" }],
      "columns": [
        { "heading": "Left heading", "points": ["...", "..."] },
        { "heading": "Right heading", "points": ["...", "..."] }
      ],
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

LAYOUTS — use the right one for the content, and vary them:
- "title": opening slide (has subtitle). Exactly one, first.
- "content": an assertion headline + 3–5 evidence bullets. Optionally a chart.
- "two-column": a comparison/contrast — provide "columns" (exactly 2, each with a heading + 2–4 points). e.g. today vs. proposed, risk vs. upside.
- "stat-block": 2–3 headline numbers — provide "stats" (each value + label). Use for the proof-point slide.
- "section": a divider that names the next act (0–1 bullets).
- "closing": the decision/next steps — bullets become an ordered ask.
Every deck MUST include at least one "stat-block", one "two-column", and one "section". Populate "stats" only on stat-block slides and "columns" only on two-column slides.

RULES — follow every one:

1. TITLE SLIDE + SUBTITLE. Slide 1 is layoutType "title". Its "subtitle" must be a genuinely compelling line that answers: "Why does this matter right now, to THIS specific audience?" — the stakes, the timing, the decision on the table. It must NOT restate or lightly reword the title. (Bad: title "Q3 Sales Review", subtitle "A review of Q3 sales". Good subtitle: "We beat plan on revenue but win rates are slipping — here's what to fix before Q4 closes.")

2. NARRATIVE ARC. Order the slides as an argument, not a table of contents: context (where we are) -> insight (the non-obvious thing the data shows) -> implication (what it means / the stakes) -> recommendation (what to do) -> next steps (who does what by when). Adapt to the topic; never emit a generic "Overview / Key Points / Summary" skeleton.

3. ASSERTION HEADLINES. Every slide "title" is a full-sentence assertion that makes a specific, falsifiable claim — never a topic label.
   - NOT "Market Overview" -> "The market has tripled, but margins are compressing."
   - NOT "Key Points" -> "Three signals suggest the window is closing."
   - NOT "Financials" -> "Revenue is up 40% while CAC has doubled."
   A reader skimming only the headlines should get the whole argument.

4. BULLETS SUPPORT THE ASSERTION. Each content slide's bullets back up its headline with specific evidence: real data, named examples, concrete observations, mechanisms, or trade-offs. Ban generic filler ("leverage synergies", "drive growth", "align stakeholders", restating the headline). 3–5 bullets on content slides; title and section slides take 0–1.

5. CHARTS ON DATA. Flag EVERY slide whose point involves numbers, comparisons, trends over time, or proportions, and attach a "chart":
   - comparison across categories -> "bar"
   - a value moving over time (months, quarters, years) -> "line"
   - parts of a whole / mix / share -> "pie" (single series)
   Use the user's real numbers when provided; otherwise use realistic, clearly-illustrative figures that make the headline's point. labels.length >= 2 and must equal each series' values length. Don't force a chart where data isn't the point.

6. SPEAKER NOTES = THE "SO WHAT". Every slide gets speakerNotes telling the presenter what to emphasize OUT LOUD that is not written on the slide — the interpretation, the risk, the number to land on, the transition to the next slide. Not a re-read of the bullets.

7. Return 6–9 slides. Output strict JSON only.`;

export function buildUserMessage(input: GenerateInput): string {
  const lines = [
    `Title: ${input.title}`,
    input.subtitle ? `Suggested subtitle (improve, do not repeat title): ${input.subtitle}` : "",
    `Start mode: ${input.mode === "content" ? "from the user's raw content/notes below" : "from the topic"}`,
    `Audience: ${input.audience || "(unspecified)"}`,
    `Objective: ${input.goal || "(unspecified)"}`,
    `Tone: ${input.tone}`,
    input.notes.trim() ? `\nSource notes / content:\n"""\n${input.notes.trim()}\n"""` : "\n(No notes provided — generate from the topic.)",
  ].filter(Boolean);
  return `Create the deck for:\n${lines.join("\n")}`;
}

// Model JSON -> DraftSlide shape used by draftsToSlides().
export interface ModelSlide {
  title?: string;
  subtitle?: string;
  layoutType?: string;
  layout?: string; // tolerated synonym for layoutType
  bullets?: unknown;
  stats?: unknown;
  columns?: unknown;
  speakerNotes?: string;
  chart?: unknown;
}

// Accept both the app's names and common synonyms the model may emit.
const LAYOUT_SYNONYMS: Record<string, LayoutType> = {
  title: "title",
  agenda: "agenda",
  content: "content",
  bullets: "content",
  "two-column": "two-column",
  two_column: "two-column",
  twocolumn: "two-column",
  comparison: "two-column",
  "stat-block": "stat-block",
  stat_block: "stat-block",
  stats: "stat-block",
  section: "section",
  section_break: "section",
  "section-break": "section",
  quote: "quote",
  closing: "closing",
  cta: "closing",
  summary: "closing",
};

export function modelSlidesToDrafts(slides: ModelSlide[]) {
  return slides.map((s, i) => {
    const raw = (s.layoutType || s.layout || "").toLowerCase().trim();
    const layoutType: LayoutType =
      LAYOUT_SYNONYMS[raw] ?? (i === 0 ? "title" : "content");
    const bullets = Array.isArray(s.bullets) ? s.bullets.map(String) : [];
    // Title slide carries its subtitle as the single body line.
    const content =
      layoutType === "title" && s.subtitle ? [s.subtitle, ...bullets] : bullets;
    return {
      title: s.title?.trim() || (i === 0 ? "Untitled" : "Slide"),
      content,
      speakerNotes: s.speakerNotes?.trim() || "",
      layoutType,
      chart: s.chart,
      stats: s.stats,
      columns: s.columns,
    };
  });
}
