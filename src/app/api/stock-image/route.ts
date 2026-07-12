import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Pexels integration, server-side so PEXELS_API_KEY stays off the client.
//  ?q=<query>  -> search Pexels, return { url, image } (remote URL + base64)
//  ?src=<url>  -> proxy a known Pexels image URL to base64 (for export embeds)
// Any failure returns { image: null } so callers fall back to solid theme
// color fills.

const ALLOWED_HOSTS = new Set(["images.pexels.com"]);

async function toDataString(url: string): Promise<string | null> {
  const img = await fetch(url);
  if (!img.ok) return null;
  const buf = Buffer.from(await img.arrayBuffer());
  const mime = img.headers.get("content-type") || "image/jpeg";
  return `${mime};base64,${buf.toString("base64")}`;
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;

  const src = params.get("src")?.trim();
  if (src) {
    try {
      const host = new URL(src).hostname;
      if (!ALLOWED_HOSTS.has(host)) {
        return NextResponse.json({ image: null });
      }
      const image = await toDataString(src);
      return NextResponse.json({ image });
    } catch {
      return NextResponse.json({ image: null });
    }
  }

  const key = process.env.PEXELS_API_KEY;
  const q = params.get("q")?.trim();
  if (!key || !q) return NextResponse.json({ image: null, url: null });

  try {
    const search = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        q,
      )}&per_page=1&orientation=landscape`,
      { headers: { Authorization: key } },
    );
    if (!search.ok) return NextResponse.json({ image: null, url: null });
    const data = (await search.json()) as {
      photos?: { src?: { landscape?: string; large2x?: string } }[];
    };
    const url =
      data.photos?.[0]?.src?.landscape ?? data.photos?.[0]?.src?.large2x;
    if (!url) return NextResponse.json({ image: null, url: null });
    const image = await toDataString(url);
    return NextResponse.json({ image, url });
  } catch {
    return NextResponse.json({ image: null, url: null });
  }
}
