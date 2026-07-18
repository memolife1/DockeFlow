import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildDeckDrafts,
  draftsToSlides,
  padOrTrimToTarget,
  type DraftSlide,
  type GenerateInput,
} from "@/lib/generate";
import {
  SYSTEM_PROMPT,
  buildUserMessage,
  modelSlidesToDrafts,
  type ModelSlide,
} from "@/lib/prompt";
import {
  isBillingConfigured,
  getAuthedUser,
  checkCanGenerate,
  incrementUsage,
} from "@/lib/subscription";
import { PLANS } from "@/lib/plans";

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

// A short, concrete image search built from a title's meatiest words —
// shared by the missing-imageQuery fallback (2B) and the layout-diversity
// swap-in below (1D), so a slide that gains an image layout after the fact
// always has something real to search for.
function fallbackImageQuery(title: string): string {
  const words = title
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4);
  return (words.slice(0, 4).join(" ") || title).toLowerCase();
}

const DATA_VIZ_LAYOUTS = new Set(["stat_kpi", "chart_focus"]);
const IMAGE_HEAVY_LAYOUTS = new Set([
  "content_image_right",
  "content_image_left",
  "image_full_bleed",
  "image_two_column",
  "image_four_grid",
  "image_showcase",
]);
const STRUCTURED_LAYOUTS = new Set(["timeline_horizontal", "process_steps", "funnel"]);
const COMPARISON_LAYOUTS = new Set(["two_column_compare", "swot_matrix"]);

// Safety net: guarantees every deck includes at least one slide from each of
// the four "premium template" composition categories (data viz, image-heavy,
// structured, comparison), and — for decks of 8+ slides — a minimum spread
// of distinct layout types, by converting surplus duplicate content_bullets
// slides into content_image_right/left rather than inventing structured
// data (chart/timeline/columns) it has no real content for.
function enforceLayoutDiversity(drafts: DraftSlide[], allowImages: boolean): DraftSlide[] {
  let out = [...drafts];
  const layoutIds = () => out.map((d) => d.layoutType as string);

  if (!layoutIds().some((id) => DATA_VIZ_LAYOUTS.has(id))) {
    out.splice(Math.max(1, out.length - 2), 0, {
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
  if (!layoutIds().some((id) => STRUCTURED_LAYOUTS.has(id))) {
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
  if (!layoutIds().some((id) => COMPARISON_LAYOUTS.has(id))) {
    out.splice(Math.max(1, out.length - 3), 0, {
      title: "Two paths forward — and the tradeoff of each",
      content: [],
      columns: [
        { heading: "Stay the course", points: ["Lower short-term disruption", "Familiar to the team"] },
        { heading: "Make the change", points: ["Faster path to the outcome", "Requires upfront investment"] },
      ],
      speakerNotes: "Frame this as the real decision on the table, not a hypothetical.",
      layoutType: "two_column_compare",
    });
  }
  if (allowImages && !layoutIds().some((id) => IMAGE_HEAVY_LAYOUTS.has(id))) {
    const insertAt = Math.min(out.length - 1, 3);
    const title = "What this looks like in practice";
    out.splice(insertAt, 0, {
      title,
      content: ["A closer look at the moment this plan is built for."],
      imageQuery: fallbackImageQuery(title),
      speakerNotes: "Use this as a visual anchor before moving into the evidence.",
      layoutType: "content_image_right",
    });
  }

  // Longer decks should visibly rotate through more than 3-4 layout types.
  // Convert surplus duplicate content_bullets slides into image layouts
  // (never touching the first or last slide) rather than leaving the deck
  // reading as one repeated template.
  if (allowImages && out.length >= 8) {
    const MIN_DISTINCT = 6;
    let side: "content_image_left" | "content_image_right" = "content_image_left";
    for (let i = 1; i < out.length - 1 && new Set(layoutIds()).size < MIN_DISTINCT; i++) {
      if (out[i].layoutType !== "content_bullets") continue;
      if (out[i - 1]?.layoutType === side || out[i + 1]?.layoutType === side) continue;
      out[i] = { ...out[i], layoutType: side, imageQuery: fallbackImageQuery(out[i].title) };
      side = side === "content_image_left" ? "content_image_right" : "content_image_left";
    }
  }

  // Re-check adjacency once more — the inserts/swaps above can create a
  // fresh same-layout pair even though the original draft list had none.
  for (let i = 1; i < out.length; i++) {
    if (out[i].layoutType === out[i - 1].layoutType && out[i].layoutType !== "content_bullets") {
      out[i] = { ...out[i], layoutType: "content_bullets" };
    }
  }

  return out;
}

// Any image-capable layout that came back from generation without an
// imageQuery would otherwise render its solid-color fallback forever —
// give it a real (if generic) search derived from the slide's own title.
function fillMissingImageQueries(drafts: DraftSlide[]): void {
  for (const d of drafts) {
    if (!IMAGE_HEAVY_LAYOUTS.has(d.layoutType as string)) continue;
    if (d.imageQuery || (Array.isArray(d.imageQueries) && d.imageQueries.length)) continue;
    d.imageQuery = fallbackImageQuery(d.title);
    console.warn(
      "[Generate] Missing imageQuery for",
      d.layoutType,
      "— using fallback:",
      d.imageQuery,
    );
  }
}

// Resolve imageQuery -> a real Pexels URL for image-zone layouts. Best-effort:
// any failure just leaves the layout's built-in placeholder/fallback color.
const IMAGE_LAYOUTS = new Set([
  "title_hero",
  "content_image_right",
  "content_image_left",
  "image_full_bleed",
]);

// Logged once per request rather than once per photo, so a missing key
// doesn't spam the same line for every image-capable slide.
let warnedNoPexelsKey = false;

async function fetchPexelsImage(query: string): Promise<string | undefined> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    if (!warnedNoPexelsKey) {
      console.error("[Pexels] No API key configured (PEXELS_API_KEY) — stock images will not load.");
      warnedNoPexelsKey = true;
    }
    return undefined;
  }
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    console.warn("[Pexels] Query too short, skipping:", query);
    return undefined;
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(trimmed)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: apiKey }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) {
      console.error("[Pexels] API error:", res.status, await res.text().catch(() => ""));
      return undefined;
    }
    const data = (await res.json()) as {
      photos?: { src?: { landscape?: string; large2x?: string; large?: string } }[];
    };
    const photos = data.photos ?? [];
    if (photos.length === 0) {
      console.warn("[Pexels] No results for query:", trimmed);
      return undefined;
    }
    // Pick from the top results (not always #1) so decks don't converge on
    // the same handful of stock photos for common queries.
    const photo = photos[Math.floor(Math.random() * Math.min(photos.length, 5))];
    const url = photo?.src?.landscape ?? photo?.src?.large2x ?? photo?.src?.large;
    console.log("[Pexels] Found image for:", trimmed, "->", url?.slice(0, 60));
    return url;
  } catch (err) {
    console.error("[Pexels] Fetch error for query:", trimmed, err);
    return undefined;
  }
}

async function resolveImages(drafts: DraftSlide[]): Promise<void> {
  await Promise.all(
    drafts.map(async (d) => {
      if (!IMAGE_LAYOUTS.has(d.layoutType as string) || !d.imageQuery) return;
      // Already satisfied by the user's own photo library — never fetch stock.
      if (d.imageQuery === "USER_PHOTO" || d.imageUrl) return;
      const url = await fetchPexelsImage(d.imageQuery);
      if (url) d.imageUrl = url;
    }),
  );
}

// Resolve each imageQueries[] entry -> a Pexels URL for the 3 multi-image
// event layouts, populating imageUrls[] (same index correspondence).
const MULTI_IMAGE_ZONES: Record<string, number> = {
  image_two_column: 2,
  image_four_grid: 4,
  image_showcase: 3,
};

async function resolveMultiImages(drafts: DraftSlide[]): Promise<void> {
  await Promise.all(
    drafts.map(async (d) => {
      const zones = MULTI_IMAGE_ZONES[d.layoutType as string];
      const queries = Array.isArray(d.imageQueries)
        ? (d.imageQueries as unknown[]).map(String).filter(Boolean)
        : [];
      if (!zones || queries.length === 0) return;
      const urls = await Promise.all(queries.slice(0, zones).map(fetchPexelsImage));
      d.imageUrls = urls.filter((u): u is string => !!u);
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

  // Usage limits only apply when there's a real backend to enforce them
  // against — the app's local/demo mode (no Supabase configured) stays
  // unrestricted, as it already is everywhere else in this codebase.
  let accessToken: string | null = null;
  let userId: string | null = null;
  if (isBillingConfigured) {
    const authHeader = req.headers.get("authorization");
    accessToken = authHeader?.replace(/^Bearer\s+/i, "") ?? null;
    const user = await getAuthedUser(accessToken);
    if (!user || !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;

    const { allowed, subscription } = await checkCanGenerate(accessToken, userId);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: `You've used all your presentations for this month on the ${subscription.planId} plan. Upgrade to continue.`,
          planId: subscription.planId,
          upgrade: true,
        },
        { status: 403 },
      );
    }

    const plan = PLANS[subscription.planId];
    const requestedSlides = body.targetSlideCount ?? 10;
    if (requestedSlides > plan.maxSlides) {
      return NextResponse.json(
        {
          error: "slide_limit_exceeded",
          message: `Your ${plan.name} plan supports up to ${plan.maxSlides} slides per presentation. Upgrade to create longer decks.`,
          maxSlides: plan.maxSlides,
          planId: subscription.planId,
          upgrade: subscription.planId !== "business",
        },
        { status: 403 },
      );
    }
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
    userImageUris: body.imageSource === "mine" ? body.userImageUris : undefined,
    imageSource: body.imageSource,
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

  drafts = enforceLayoutDiversity(drafts, body.imageSource !== "none");
  if (input.targetSlideCount) drafts = padOrTrimToTarget(drafts, input.targetSlideCount);
  fillMissingImageQueries(drafts);
  resolveUserImages(drafts, input.userImageUris);
  if (body.useStockImages) {
    await resolveImages(drafts);
    await resolveMultiImages(drafts);
  }

  const slides = draftsToSlides(input.presentationId, drafts);

  if (isBillingConfigured && accessToken && userId) {
    await incrementUsage(accessToken, userId).catch(() => {});
  }

  return NextResponse.json({ slides, source });
}
