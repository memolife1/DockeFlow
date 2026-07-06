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
  type ModelSlide,
} from "@/lib/prompt";

export const runtime = "nodejs";

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
      max_tokens: 3500,
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

export async function POST(req: Request) {
  let body: GenerateInput;
  try {
    body = (await req.json()) as GenerateInput;
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

  const slides = draftsToSlides(input.presentationId, drafts);
  return NextResponse.json({ slides, source });
}
