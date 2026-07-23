import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Full Pexels search for the editor's "Replace image" picker — distinct from
// /api/stock-image (which resolves a single generation-time query, or proxies
// a known Pexels URL to base64 for export embeds). This one returns a grid
// of candidates for the user to choose from directly.
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  // Max 30 searches per minute per user — each one spends Pexels API quota.
  const rl = rateLimit(`pexels-search:${auth.user.id}`, 30, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many searches. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rl.resetIn) } },
    );
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const perPage = Math.min(Number(req.nextUrl.searchParams.get("per_page")) || 9, 20);

  if (!q.trim()) {
    return NextResponse.json({ photos: [] });
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Pexels isn't configured for this deployment." }, { status: 501 });
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${perPage}&orientation=landscape`,
      { headers: { Authorization: apiKey }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) {
      return NextResponse.json({ photos: [] });
    }
    const data = (await res.json()) as {
      photos?: { id: number; src?: { large2x?: string; medium?: string }; photographer?: string; alt?: string }[];
    };
    return NextResponse.json({ photos: data.photos ?? [] });
  } catch (err) {
    console.error("[pexels/search] fetch failed:", err);
    return NextResponse.json({ photos: [] });
  }
}
