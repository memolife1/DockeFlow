import JSZip from "jszip";

// ---------------------------------------------------------------------------
// Extracts a brand theme from an uploaded .pptx: unzips it (a .pptx is a ZIP
// of OOXML), parses ppt/theme/theme1.xml for the color + font scheme, and
// pulls the first usable image out of ppt/media/ as a logo candidate. Only
// brand extraction is attempted — we do not clone the source deck's layouts.
// ---------------------------------------------------------------------------

export interface ExtractedBrand {
  name: string;
  colors: {
    dk1?: string;
    lt1?: string;
    dk2?: string;
    lt2?: string;
    accent1?: string;
    accent2?: string;
    accent3?: string;
    accent4?: string;
    accent5?: string;
    accent6?: string;
  };
  fontHead?: string;
  fontBody?: string;
  logoDataUri?: string;
  logoMime?: string;
  // Non-neutral colors actually used in the slide shapes, ranked by how often
  // they appear — the theme's accent1 is just a generic palette slot and
  // isn't necessarily the color the deck's author actually designed with.
  slideColors: { hex: string; count: number }[];
}

function tag(xml: string, name: string): string | undefined {
  // Find the <a:NAME>...</a:NAME> block first (tolerating attributes on the
  // opening tag and any whitespace/newlines), then search within it for a
  // srgbClr/sysClr color — this handles real-world PPTX theme XML that isn't
  // as tightly formatted as PowerPoint's own defaults.
  const blockRe = new RegExp(`<a:${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/a:${name}>`, "i");
  const block = xml.match(blockRe)?.[1];
  if (!block) return undefined;
  const colorRe = /<a:(?:srgbClr|sysClr)[^>]*\s(?:val|lastClr)="([0-9A-Fa-f]{6})"/i;
  const m = block.match(colorRe);
  return m?.[1]?.toUpperCase();
}

function fontTag(xml: string, scheme: "majorFont" | "minorFont"): string | undefined {
  const re = new RegExp(`<a:${scheme}>\\s*<a:latin typeface="([^"]+)"`, "i");
  const m = xml.match(re);
  const face = m?.[1];
  return face && face !== "+mn-lt" && face !== "+mj-lt" ? face : undefined;
}

// Heuristic for a "logo-like" media file: small-ish, PNG/JPEG/GIF, and not
// obviously a full-bleed background photo (rough size gate applied by caller
// via byte length; here we just filter by extension).
const LOGO_EXT = /\.(png|jpe?g|gif|svg)$/i;

// Returns true if a hex color is a neutral we should ignore when scanning for
// the brand's real color (white, near-white, black, near-black, or gray).
function isNeutral(hex: string): boolean {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (r > 220 && g > 220 && b > 220) return true; // near-white
  if (r < 40 && g < 40 && b < 40) return true; // near-black
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  return saturation < 0.12; // low saturation = gray
}

// Scans ppt/slides/slide*.xml for srgbClr values and ranks the non-neutral
// ones by occurrence — the most-used color across the actual slide shapes is
// a far more reliable signal for "the brand color" than the theme's generic
// accent1 palette slot, which many templates leave at a default and never
// actually use in the deck.
async function scanSlideColors(zip: JSZip): Promise<{ hex: string; count: number }[]> {
  const slideFiles = Object.keys(zip.files).filter((name) =>
    /^ppt\/slides\/slide\d+\.xml$/i.test(name),
  );

  const freq: Record<string, number> = {};
  for (const path of slideFiles) {
    const content = await zip.files[path].async("string");
    const matches = content.matchAll(/srgbClr val="([0-9A-Fa-f]{6})"/gi);
    for (const m of matches) {
      const hex = m[1].toUpperCase();
      if (isNeutral(hex)) continue;
      freq[hex] = (freq[hex] ?? 0) + 1;
    }
  }

  return Object.entries(freq)
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count);
}

export async function extractBrandFromPptx(
  buf: ArrayBuffer,
  fallbackName: string,
): Promise<ExtractedBrand> {
  const zip = await JSZip.loadAsync(buf);

  const themeFile =
    zip.file("ppt/theme/theme1.xml") ||
    Object.values(zip.files).find((f) => /ppt\/theme\/theme\d*\.xml$/i.test(f.name));
  const themeXml = themeFile ? await themeFile.async("text") : "";
  const themeName = themeXml.match(/<a:theme[^>]*\sname="([^"]+)"/i)?.[1];

  const colors: ExtractedBrand["colors"] = {
    dk1: tag(themeXml, "dk1"),
    lt1: tag(themeXml, "lt1"),
    dk2: tag(themeXml, "dk2"),
    lt2: tag(themeXml, "lt2"),
    accent1: tag(themeXml, "accent1"),
    accent2: tag(themeXml, "accent2"),
    accent3: tag(themeXml, "accent3"),
    accent4: tag(themeXml, "accent4"),
    accent5: tag(themeXml, "accent5"),
    accent6: tag(themeXml, "accent6"),
  };

  const fontHead = fontTag(themeXml, "majorFont");
  const fontBody = fontTag(themeXml, "minorFont");

  // First logo-like media file, smallest first (logos are typically much
  // smaller than photo assets in a brand deck).
  const mediaFiles = Object.values(zip.files).filter(
    (f) => /ppt\/media\//i.test(f.name) && LOGO_EXT.test(f.name) && !f.dir,
  );
  let logoDataUri: string | undefined;
  let logoMime: string | undefined;
  if (mediaFiles.length) {
    const withSize = await Promise.all(
      mediaFiles.map(async (f) => ({
        f,
        buf: await f.async("nodebuffer"),
      })),
    );
    withSize.sort((a, b) => a.buf.length - b.buf.length);
    const pick = withSize[0];
    if (pick && pick.buf.length < 2_000_000) {
      const ext = pick.f.name.split(".").pop()?.toLowerCase();
      logoMime =
        ext === "png"
          ? "image/png"
          : ext === "svg"
          ? "image/svg+xml"
          : ext === "gif"
          ? "image/gif"
          : "image/jpeg";
      logoDataUri = `data:${logoMime};base64,${pick.buf.toString("base64")}`;
    }
  }

  // Prefer the theme's own name (e.g. "Northwind Brand") over the filename,
  // skipping PowerPoint's generic defaults ("Office Theme", "Theme1"...).
  const GENERIC_NAME = /^(office theme|theme\d*|blank presentation)$/i;
  const niceName =
    themeName && !GENERIC_NAME.test(themeName.trim()) ? themeName.trim() : undefined;

  const slideColors = await scanSlideColors(zip);

  return {
    name:
      niceName ||
      fallbackName.replace(/\.[^.]+$/, "").slice(0, 60) ||
      "Custom brand",
    colors,
    fontHead,
    fontBody,
    logoDataUri,
    logoMime,
    slideColors,
  };
}
