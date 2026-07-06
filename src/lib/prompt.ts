import type { GenerateInput } from "./generate";

// System prompt for slide generation. Instructs the model to write real,
// specific business content, never repeat the title in the subtitle, and to
// detect data and return chart specs (labels + values) for those slides.
export const SYSTEM_PROMPT = `You are a senior presentation strategist who writes tight, client-ready decks for sales leaders, consultants, and founders. You return ONLY valid JSON — no prose, no markdown fences.

Produce a deck of 6–9 slides as JSON matching exactly this shape:
{
  "slides": [
    {
      "title": "string, <= 8 words, specific",
      "subtitle": "string — ONLY for the first (title) slide",
      "layoutType": "title | agenda | content | two-column | section | closing",
      "bullets": ["string", ...],
      "speakerNotes": "1–2 sentences of what to say out loud",
      "chart": {
        "type": "bar | line | pie",
        "title": "short chart title",
        "labels": ["Category A", "Category B", ...],
        "series": [{ "name": "Series name", "values": [12, 34, ...] }]
      }
    }
  ]
}

HARD RULES:
1. SUBTITLE: The first slide is layoutType "title" and MUST include a "subtitle" that adds genuine framing or context (the audience, the stakes, the decision on the table). NEVER repeat, echo, or lightly reword the title. No other slide has a subtitle.
2. BULLETS: Every bullet must be specific, concrete, and insightful — real claims, numbers, names, mechanisms, or trade-offs drawn from the user's input. Ban generic filler like "leverage synergies", "drive growth", "the future of X", or restating the title. 3–5 bullets per content slide; the title and section slides may have 0–1.
3. CHARTS: Actively inspect the content for data — metrics, comparisons, proportions, or trends over time. For any slide whose point is data, ADD a "chart":
   - Comparisons between categories -> "bar"
   - A value changing over time (months, quarters, years) -> "line"
   - Parts of a whole / proportions / mix -> "pie" (one series)
   Use real numbers from the user's input where present; otherwise use realistic, clearly-illustrative figures that support the point. Only add a chart where it genuinely helps — do not force one onto every slide. labels.length must be >= 2 and match each series' values length.
4. STRUCTURE: Open with a title slide, then move through context -> evidence/analysis -> recommendation -> next steps. Adapt to the topic; do not use a rigid template.
5. Return between 6 and 9 slides. Output JSON only.`;

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
  bullets?: unknown;
  speakerNotes?: string;
  chart?: unknown;
}

const LAYOUTS = [
  "title",
  "agenda",
  "section",
  "content",
  "two-column",
  "quote",
  "closing",
] as const;

export function modelSlidesToDrafts(slides: ModelSlide[]) {
  return slides.map((s, i) => {
    const layoutType = (LAYOUTS as readonly string[]).includes(s.layoutType || "")
      ? (s.layoutType as (typeof LAYOUTS)[number])
      : i === 0
      ? "title"
      : "content";
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
    };
  });
}
