import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Returns a Pexels photo as a base64 data string for the title-slide
// background. Server-side so the PEXELS_API_KEY stays off the client. Any
// failure (no key, network, no results) returns { image: null } so the
// exporter falls back silently to the solid colored-panel layout.
export async function GET(req: Request) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return NextResponse.json({ image: null });

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ image: null });

  try {
    const search = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        q,
      )}&per_page=1&orientation=landscape`,
      { headers: { Authorization: key } },
    );
    if (!search.ok) return NextResponse.json({ image: null });
    const data = (await search.json()) as {
      photos?: { src?: { landscape?: string; large2x?: string } }[];
    };
    const url = data.photos?.[0]?.src?.landscape ?? data.photos?.[0]?.src?.large2x;
    if (!url) return NextResponse.json({ image: null });

    const img = await fetch(url);
    if (!img.ok) return NextResponse.json({ image: null });
    const buf = Buffer.from(await img.arrayBuffer());
    const mime = img.headers.get("content-type") || "image/jpeg";
    return NextResponse.json({ image: `${mime};base64,${buf.toString("base64")}` });
  } catch {
    return NextResponse.json({ image: null });
  }
}
