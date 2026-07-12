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
}

function tag(xml: string, name: string): string | undefined {
  // <a:dk1><a:srgbClr val="112233"/></a:dk1>  OR  <a:sysClr val="windowText" lastClr="000000"/>
  const re = new RegExp(
    `<a:${name}>\\s*<a:(?:srgbClr|sysClr)[^>]*(?:val|lastClr)="([0-9A-Fa-f]{6})"[^>]*/?>`,
    "i",
  );
  const m = xml.match(re);
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
  };
}
