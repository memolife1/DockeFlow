import { NextResponse } from "next/server";
import { contrast, normHex } from "@/lib/layouts/theme";
import { assertPublicHttpUrl, UnsafeUrlError } from "@/lib/netGuard";
import { requireAuth } from "@/lib/auth/requireAuth";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_HTML_BYTES = 2_000_000;
const MAX_LOGO_BYTES = 500_000;

function normalizeHexColor(raw: string): string | undefined {
  let hex = raw.trim();
  if (hex.startsWith("#")) hex = hex.slice(1);
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  return /^[0-9a-fA-F]{6}$/.test(hex) ? hex.toUpperCase() : undefined;
}

function rgbToHex(r: number, g: number, b: number): string {
  return [r, g, b]
    .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

// Parses any CSS color value (#hex, #rgb, rgb()/rgba()) into a 6-digit hex.
function parseCssColor(raw: string): string | undefined {
  const trimmed = raw.trim();
  const hexMatch = trimmed.match(/#([0-9a-fA-F]{3,8})\b/);
  if (hexMatch) return normalizeHexColor(hexMatch[1]);
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) return rgbToHex(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]));
  return undefined;
}

// Finds the declaration block for the first selector matching `selectorRe`
// and pulls a color-like value out of `prop` (or `background`/`background-color`
// interchangeably, since real stylesheets use either).
function ruleColor(css: string, selectorSrc: string, props: string[]): string | undefined {
  const blockRe = new RegExp(`(?:^|[\\s,{}])(${selectorSrc})(?:[^{]*)\\{([^}]*)\\}`, "i");
  const block = css.match(blockRe)?.[2];
  if (!block) return undefined;
  for (const prop of props) {
    const propRe = new RegExp(`${prop}\\s*:\\s*([^;]+);?`, "i");
    const m = block.match(propRe);
    const color = m ? parseCssColor(m[1]) : undefined;
    if (color) return color;
  }
  return undefined;
}

interface ExtractedColors {
  primary?: string;
  dark?: string;
  accent?: string;
  surface?: string;
}

// Multi-strategy brand color extraction, since most real sites don't expose
// their palette through a single mechanism:
//   1. <meta name="theme-color"> — browsers/PWAs use this for the brand color.
//   2. CSS custom properties (--primary, --brand-color, etc).
//   3. Actual CSS rules on header/nav/.btn-primary/body/h1 selectors.
//   4. (caller falls back to sensible defaults if all strategies miss)
function extractColorsFromHtml(html: string, css: string): ExtractedColors {
  const colors: ExtractedColors = {};

  const themeColorMatch = html.match(
    /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i,
  );
  if (themeColorMatch) {
    colors.primary = parseCssColor(themeColorMatch[1]);
  }

  const cssVarColors: Record<string, string> = {};
  const varRegex = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\))/g;
  let m: RegExpExecArray | null;
  while ((m = varRegex.exec(css)) !== null) {
    const color = parseCssColor(m[2]);
    if (color) cssVarColors[m[1].toLowerCase()] = color;
  }
  const findVar = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      for (const [varName, hex] of Object.entries(cssVarColors)) {
        if (varName.includes(k)) return hex;
      }
    }
    return undefined;
  };

  if (!colors.primary) {
    colors.primary = findVar("primary", "brand", "main", "key", "blue", "cobalt");
  }
  colors.dark = findVar("dark", "text", "ink", "body-color", "foreground", "black");
  colors.accent = findVar("accent", "highlight", "secondary", "cta");
  colors.surface = findVar("surface", "background", "light", "white", "bg");

  if (!colors.primary) {
    colors.primary =
      ruleColor(css, "\\.btn-primary", ["background-color", "background"]) ||
      ruleColor(css, "(?:header|nav)", ["background-color", "background"]);
  }
  if (!colors.dark) {
    colors.dark = ruleColor(css, "body", ["color"]) || ruleColor(css, "h1", ["color"]);
  }
  if (!colors.accent) {
    colors.accent =
      ruleColor(css, "h1", ["color"]) || ruleColor(css, "\\.btn-primary", ["color"]);
  }
  if (!colors.surface) {
    colors.surface = ruleColor(css, "body", ["background-color", "background"]);
  }

  return colors;
}

// Extracts a best-effort brand (colors, font, logo) from a public website's
// HTML/CSS — for users who want a generated deck to match a client's site
// instead of uploading a .pptx. Heuristic, not a pixel-perfect scrape: reads
// CSS custom properties, favicon/og:image, and font-family declarations.
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  // Max 20 URL extractions per minute per user — each one fetches an
  // arbitrary external site plus its stylesheets and favicon.
  const rl = rateLimit(`extract-url:${auth.user.id}`, 20, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(rl.resetIn) } },
    );
  }

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

  // Gather CSS from inline <style> blocks plus (best-effort) the first couple
  // of linked stylesheets — most real sites keep their actual brand colors in
  // an external stylesheet, not inline <style> tags.
  const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
  const linkedHrefs = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)]
    .map((m) => m[0].match(/href=["']([^"']+)["']/i)?.[1])
    .filter((h): h is string => !!h)
    .slice(0, 2);
  const linkedCss = (
    await Promise.all(
      linkedHrefs.map(async (href) => {
        try {
          const absolute = href.startsWith("http") ? href : new URL(href, url).href;
          const safe = await assertPublicHttpUrl(absolute);
          const res = await fetch(safe.href, { signal: AbortSignal.timeout(4000) });
          if (!res.ok) return "";
          const buf = await res.arrayBuffer();
          return Buffer.from(buf.slice(0, 500_000)).toString("utf-8");
        } catch {
          return "";
        }
      }),
    )
  ).join("\n");
  const allCss = `${styleBlocks}\n${linkedCss}`;

  const { primary: rawPrimary, dark: rawDark, accent: rawAccent, surface: rawSurface } =
    extractColorsFromHtml(html, allCss);

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

  // Extract the site name — prefer explicit app/site-name meta tags over the
  // <title>, which is often padded with taglines ("Stripe | Payments...").
  const appNameMatch = html.match(
    /<meta[^>]+name=["']application-name["'][^>]+content=["']([^"']+)["']/i,
  );
  const siteNameMatch = html.match(
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
  );
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const name =
    appNameMatch?.[1] ||
    siteNameMatch?.[1] ||
    titleMatch?.[1]?.split(/[|\-–]/)[0].trim() ||
    url.hostname;

  const brand = {
    name: name.slice(0, 50),
    roles: { primary, dark, accent, surface },
    fontHead,
    fontBody,
    logoDataUri,
  };

  return NextResponse.json({ brand, source: "url", domain: url.hostname });
}
