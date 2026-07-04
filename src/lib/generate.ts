import type { LayoutType, Slide, Tone } from "./types";
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

interface DraftSlide {
  title: string;
  content: string[];
  speakerNotes: string;
  layoutType: LayoutType;
}

// ---- Small content helpers -------------------------------------------------

function sentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

function keyPhrases(text: string, count: number): string[] {
  const lines = text
    .split(/\n|•|-|•/)
    .map((l) => l.trim())
    .filter((l) => l.length > 4);
  const source = lines.length >= count ? lines : sentences(text);
  return source.slice(0, count).map(tidy);
}

function tidy(s: string): string {
  const clean = s.replace(/\s+/g, " ").trim().replace(/[.]$/, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

const TONE_VERB: Record<Tone, string> = {
  professional: "outlines",
  confident: "makes the case for",
  consultative: "works through",
  friendly: "walks through",
  visionary: "sets the direction for",
};

// ---- Deck engine -----------------------------------------------------------
// Produces a business-structured 6–10 slide deck. Adapts by mode and objective.
// This is the single seam where a real LLM call would live later.

export function buildDeck(input: GenerateInput): Slide[] {
  const { title, audience, goal, tone, notes, mode } = input;
  const aud = audience.trim() || "your audience";
  const objective = goal.trim() || "align on the path forward";

  const notePoints = notes.trim() ? keyPhrases(notes, 8) : [];
  const hasNotes = notePoints.length > 0;

  const drafts: DraftSlide[] = [];

  // 1. Title
  drafts.push({
    title,
    content: [
      input.subtitle?.trim() || `Prepared for ${aud}`,
    ],
    speakerNotes: `Open by framing why this matters to ${aud}. Keep it to one sentence, then move on.`,
    layoutType: "title",
  });

  // 2. Agenda
  drafts.push({
    title: "What we'll cover",
    content: [
      "Context and where things stand",
      mode === "content" ? "Key points from the material" : "The core opportunity",
      "Analysis and what it means",
      "Recommendation",
      "Next steps",
    ],
    speakerNotes: "Set expectations. Tell them this will take five slides and end with a clear ask.",
    layoutType: "agenda",
  });

  // 3. Context / Problem
  drafts.push({
    title: "Where things stand",
    content: hasNotes
      ? notePoints.slice(0, 3)
      : [
          `${aud} needs a clear read on ${title.toLowerCase()}`,
          "Current approach leaves value on the table",
          "The cost of waiting is rising",
        ],
    speakerNotes: `Ground the room in today's reality before proposing anything. This deck ${TONE_VERB[tone]} the situation for ${aud}.`,
    layoutType: "content",
  });

  // 4. Key points / Analysis
  drafts.push({
    title: mode === "content" ? "Key points" : "The opportunity",
    content: hasNotes
      ? notePoints.slice(3, 7)
      : [
          "Demand is real and growing in the segment",
          "We can move faster than the current baseline",
          "Early signals point to a repeatable model",
          "The team and tooling are in place",
        ],
    speakerNotes: "Spend the most time here. These are the load-bearing points — everything downstream rests on them.",
    layoutType: "two-column",
  });

  // 5. Analysis / What it means
  drafts.push({
    title: "What this means",
    content: [
      `For ${aud}, the implication is a clearer, faster path`,
      "Focus effort where it compounds",
      "Reduce the moving parts that slow decisions",
    ],
    speakerNotes: "Translate the points above into consequences the audience cares about. Make it about them, not the data.",
    layoutType: "content",
  });

  // 6. Recommendation
  drafts.push({
    title: "Recommendation",
    content: [
      `Commit to a focused plan to ${objective}`,
      "Start with the highest-leverage move",
      "Set a measurable checkpoint in 30 days",
    ],
    speakerNotes: "State the recommendation in one line, then support it. Be direct — this is the point of the deck.",
    layoutType: "section",
  });

  // 7. Next steps
  drafts.push({
    title: "Next steps",
    content: [
      "Confirm scope and owner this week",
      "Kick off the first workstream",
      "Review progress at the 30-day mark",
    ],
    speakerNotes: "End with a concrete ask. Name the owner and the date before you close.",
    layoutType: "closing",
  });

  // Optionally extend to keep within the 6–10 range when notes are rich.
  if (hasNotes && notePoints.length >= 7) {
    drafts.splice(5, 0, {
      title: "Supporting detail",
      content: notePoints.slice(6, 8),
      speakerNotes: "Use this only if asked to go deeper. Otherwise keep it as backup.",
      layoutType: "two-column",
    });
  }

  return drafts.map((d, i) => ({
    id: uid("slide"),
    presentationId: input.presentationId,
    orderIndex: i,
    title: d.title,
    content: d.content,
    speakerNotes: d.speakerNotes,
    layoutType: d.layoutType,
  }));
}
