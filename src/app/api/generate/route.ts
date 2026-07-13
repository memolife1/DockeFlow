import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildDeckDrafts,
  draftsToSlides,
  type DraftSlide,
  type GenerateInput,
} from "@/lib/generate";
import {
  SYSTEM_PROMPT,
  buildUserMessage,
  modelSlidesToDrafts,
  hasRequiredLayouts,
  type ModelSlide,
} from "@/lib/prompt";

export const runtime = "nodejs";

interface GenerateBody extends GenerateInput {
  useStockImages?: boolean;
}

// Pull a JSON object out of the model's text response.
function extractJson(text: string): { slides?: ModelSlide[] } | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

// Claude generation. Returns null when no API key is configured or on any
// failure, so the deterministic engine can take over.
async function generateWithClaude(
  input: GenerateInput,
): Promise<DraftSlide[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const client = new Anthropic({
      apiKey,
      // Only override the endpoint via a dedicated var, never the harness one.
      baseURL: process.env.ANTHROPIC_API_BASE_URL || undefined,
    });
    const model = process.env.GENERATION_MODEL || "claude-sonnet-5";
    const message = await client.messages.create({
      model,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(input) }],
    });
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const parsed = extractJson(text);
    if (!parsed?.slides?.length) return null;
    return modelSlidesToDrafts(parsed.slides);
  } catch (err) {
    console.error("Claude generation failed, falling back to engine:", err);
    return null;
  }
}

// Safety net: if the model (or fallback engine, in an unusual input) doesn't
// include the required stat_kpi / visual layout, splice a synthesized one in
// so every deck meets the "premium template" composition bar.
function ensureRequiredLayouts(drafts: DraftSlide[]): DraftSlide[] {
  const { hasStat, hasVisual } = hasRequiredLayouts(drafts);
  const out = [...drafts];
  const insertAt = Math.max(1, out.length - 2);

  if (!hasStat) {
    out.splice(insertAt, 0, {
      title: "The numbers behind the recommendation",
      content: [],
      stats: [
        { value: "3x", label: "Faster path with focused execution" },
        { value: "90 d", label: "To the first measurable checkpoint" },
      ],
      speakerNotes: "Land these two numbers, then move to the ask.",
      layoutType: "stat_kpi",
    });
  }
  if (!hasVisual) {
    out.splice(Math.max(1, out.length - 1), 0, {
      title: "The plan, in three checkpoints",
      content: [],
      timeline: [
        { label: "Day 1–30", detail: "Confirm scope and owner" },
        { label: "Day 31–60", detail: "Execute the first workstream" },
        { label: "Day 61–90", detail: "Review results, decide next step" },
      ],
      speakerNotes: "Walk the checkpoints left to right before the close.",
      layoutType: "timeline_horizontal",
    });
  }
  return out;
}

// Resolve imageQuery -> a real Pexels URL for image-zone layouts. Best-effort:
// any failure just leaves the layout's built-in placeholder/fallback color.
const IMAGE_LAYOUTS = new Set(["title_hero", "content_image_right", "content_image_left"]);

async function resolveImages(drafts: DraftSlide[]): Promise<void> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return;
  await Promise.all(
    drafts.map(async (d) => {
      if (!IMAGE_LAYOUTS.has(d.layoutType as string) || !d.imageQuery) return;
      // Already satisfied by the user's own photo library — never fetch stock.
      if (d.imageQuery === "USER_PHOTO" || d.imageUrl) return;
      try {
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(
            d.imageQuery,
          )}&per_page=1&orientation=landscape`,
          { headers: { Authorization: key } },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          photos?: { src?: { landscape?: string; large2x?: string } }[];
        };
        const url = data.photos?.[0]?.src?.landscape ?? data.photos?.[0]?.src?.large2x;
        if (url) d.imageUrl = url;
      } catch {
        /* leave the layout's fallback color in place */
      }
    }),
  );
}

// Assign the user's own uploaded photos (data URIs) to any slide the model
// flagged with imageQuery: "USER_PHOTO", rotating through the library so
// multiple image slides don't all show the same photo.
function resolveUserImages(drafts: DraftSlide[], userImageUris?: string[]): void {
  if (!userImageUris?.length) return;
  let i = 0;
  for (const d of drafts) {
    if (d.imageQuery === "USER_PHOTO") {
      d.imageUrl = userImageUris[i % userImageUris.length];
      i++;
    }
  }
}

export async function POST(req: Request) {
  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "A title is required" }, { status: 400 });
  }

  const input: GenerateInput = {
    presentationId: body.presentationId,
    title: body.title,
    subtitle: body.subtitle,
    mode: body.mode,
    audience: body.audience,
    goal: body.goal,
    tone: body.tone,
    notes: body.notes ?? "",
    language: body.language,
    targetSlideCount: body.targetSlideCount,
    userImageUris: body.userImageUris,
  };

  const claudeDrafts = await generateWithClaude(input);
  let source: "claude" | "engine" = "claude";
  let drafts = claudeDrafts;
  if (!drafts) {
    source = "engine";
    drafts = buildDeckDrafts(input);
    // Keep the loading state believable when running the local engine.
    await new Promise((r) => setTimeout(r, 800));
  }

  drafts = ensureRequiredLayouts(drafts);
  resolveUserImages(drafts, input.userImageUris);
  if (body.useStockImages) await resolveImages(drafts);

  const slides = draftsToSlides(input.presentationId, drafts);
  return NextResponse.json({ slides, source });
}
