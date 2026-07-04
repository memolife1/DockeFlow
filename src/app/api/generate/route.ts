import { NextResponse } from "next/server";
import { buildDeck, type GenerateInput } from "@/lib/generate";

// Deck generation endpoint. Today it runs a deterministic content engine;
// this is the single seam where a real LLM call would be introduced later.
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

  const slides = buildDeck({
    presentationId: body.presentationId,
    title: body.title,
    subtitle: body.subtitle,
    mode: body.mode,
    audience: body.audience,
    goal: body.goal,
    tone: body.tone,
    notes: body.notes ?? "",
  });

  // Simulate model latency so loading states are exercised end to end.
  await new Promise((r) => setTimeout(r, 1100));

  return NextResponse.json({ slides });
}
