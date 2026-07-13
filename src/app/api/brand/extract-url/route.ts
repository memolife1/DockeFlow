import { NextResponse } from "next/server";
import { contrast, normHex } from "@/lib/layouts/theme";
import { assertPublicHttpUrl, UnsafeUrlError } from "@/lib/netGuard";

export const runtime = "nodejs";

const MAX_HTML_BYTES = 2_000_000;
const MAX_LOGO_BYTES = 500_000;

// Extracts a best-effort brand (colors, font, logo) from a public website's
// HTML/CSS — for users who want a generated deck to match a client's site
// instead of uploading a .pptx. Heuristic, not a pixel-perfect scrape: reads
// CSS custom properties, favicon/og:image, and font-family declarations.
export async function POST(req: Request) {
  const { url: rawUrl } = await req.json().catch(() => ({}));
  if (!rawUrl || typeof rawUrl !== "string") {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  let url: URL;
  try {
    url = await assertPublicHttpUrl(rawUrl);
  } catch (err) {
    const message = err instanceof UnsafeUrlError ? err.message : "Invalid URL.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  let html: string;
  try {
    const res = await fetch(url.href, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DeckeFlow/1.0)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const buf = await res.arrayBuffer();
    html = Buffer.from(buf.slice(0, MAX_HTML_BYTES)).toString("utf-8");
  } catch {
    return NextResponse.json(
      { error: "Could not reach that website. Check the URL and try again." },
      { status: 422 },
    );
  }

  // Extract favicon / logo.
  const faviconMatch =
    html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i);
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const logoUrl = faviconMatch?.[1] || ogImageMatch?.[1];

  // Extract CSS colors from <style> blocks.
  const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
  const allCss = styleBlocks;

  // Look for CSS custom properties that are color-like.
  const cssVarColors: Record<string, string> = {};
  const varRegex = /--([\w-]+)\s*:\s*#([0-9a-fA-F]{3,6})\b/g;
  let m: RegExpExecArray | null;
  while ((m = varRegex.exec(allCss)) !== null) {
    const hex = m[2];
    cssVarColors[m[1].toLowerCase()] =
      hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  }

  const findColor = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      for (const [varName, hex] of Object.entries(cssVarColors)) {
        if (varName.includes(k)) return hex.toUpperCase();
      }
    }
    return undefined;
  };

  const rawPrimary = findColor("primary", "brand", "main", "key", "blue", "cobalt");
  const rawDark = findColor("dark", "text", "ink", "body", "foreground", "black");
  const rawAccent = findColor("accent", "highlight", "secondary", "cta");
  const rawSurface = findColor("surface", "background", "light", "white", "bg");

  const primary = normHex(rawPrimary, "2B4EFF");
  // Guard against an unreadably light "dark" color the same way the .pptx
  // extraction route does — a website's --text-dark var isn't guaranteed to
  // actually hold white text well.
  let dark = normHex(rawDark, "111827");
  if (contrast("FFFFFF", dark) < 4.5) dark = "111827";
  const accent = normHex(rawAccent, primary);
  const surface = normHex(rawSurface, "FFFFFF");

  // Extract font-family from body/heading CSS.
  const fontMatch = allCss.match(/(?:body|html)[^{]*\{[^}]*font-family\s*:\s*([^;}{]+)/i);
  const headingFontMatch = allCss.match(/(?:h1|h2|heading)[^{]*\{[^}]*font-family\s*:\s*([^;}{]+)/i);

  const cleanFont = (raw: string | undefined) =>
    raw?.split(",")[0]?.replace(/['"`]/g, "").trim();

  const fontHead = cleanFont(headingFontMatch?.[1]) || cleanFont(fontMatch?.[1]);
  const fontBody = cleanFont(fontMatch?.[1]);

  // Try to fetch the favicon as a data URI for the logo (SSRF-guarded too —
  // the href could point anywhere).
  let logoDataUri: string | undefined;
  if (logoUrl) {
    try {
      const absoluteUrl = logoUrl.startsWith("http") ? logoUrl : new URL(logoUrl, url).href;
      const safeLogo = await assertPublicHttpUrl(absoluteUrl);
      const logoRes = await fetch(safeLogo.href, { signal: AbortSignal.timeout(4000) });
      if (logoRes.ok) {
        const contentType = logoRes.headers.get("content-type") || "image/png";
        const buf = await logoRes.arrayBuffer();
        if (buf.byteLength > 0 && buf.byteLength < MAX_LOGO_BYTES) {
          logoDataUri = `data:${contentType};base64,${Buffer.from(buf).toString("base64")}`;
        }
      }
    } catch {
      /* logo is optional */
    }
  }

  // Extract the site name from <title> or og:site_name.
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const siteNameMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
  const name = siteNameMatch?.[1] || titleMatch?.[1]?.split(/[|\-–]/)[0].trim() || url.hostname;

  const brand = {
    name: name.slice(0, 50),
    roles: { primary, dark, accent, surface },
    fontHead,
    fontBody,
    logoDataUri,
  };

  return NextResponse.json({ brand, source: "url", domain: url.hostname });
}
