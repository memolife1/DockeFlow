import { NextResponse } from "next/server";
import { extractBrandFromPptx } from "@/lib/brandExtract";
import { contrast, normHex } from "@/lib/layouts/theme";

export const runtime = "nodejs";

// Euclidean distance in RGB space — used to decide whether two slide-scanned
// colors are distinct enough to serve as separate primary/accent roles, or
// whether they're really the same brand color (e.g. two shades of amber).
function colorDistance(hex1: string, hex2: string): number {
  const r1 = parseInt(hex1.slice(0, 2), 16);
  const g1 = parseInt(hex1.slice(2, 4), 16);
  const b1 = parseInt(hex1.slice(4, 6), 16);
  const r2 = parseInt(hex2.slice(0, 2), 16);
  const g2 = parseInt(hex2.slice(2, 4), 16);
  const b2 = parseInt(hex2.slice(4, 6), 16);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Accepts an uploaded .pptx (multipart/form-data, field "file"), extracts its
// theme colors/fonts/logo, and returns a TemplateTheme["brand"]-shaped object
// plus the raw palette for the confirmation UI. Contrast is checked here too
// so the client preview matches what buildThemeSpec() will actually use.
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!/\.pptx$/i.test(file.name)) {
    return NextResponse.json(
      { error: "Only .pptx brand templates can be parsed for a real theme." },
      { status: 400 },
    );
  }

  try {
    const buf = await file.arrayBuffer();
    const extracted = await extractBrandFromPptx(buf, file.name);
    console.log("[brand-extract]", { name: extracted.name, colors: extracted.colors });

    const dk = normHex(extracted.colors.dk1, "1A1B21");
    const lt = normHex(extracted.colors.lt1, "FFFFFF");
    // dk2 is usually the "real" dark brand color; dk1 is often near-black text.
    let dark = normHex(extracted.colors.dk2 || extracted.colors.dk1, "1A1B21");
    if (contrast("FFFFFF", dark) < 4.5) dark = normHex(extracted.colors.dk1, "10151E");
    const surface = contrast(lt, "000000") > 1.2 ? lt : "FFFFFF";

    // Theme accent1/accent2 are just generic palette slots — many templates
    // never actually use them in the deck. The colors that actually appear
    // in the slide shapes are a much more reliable "true brand color" signal.
    let primary = normHex(extracted.colors.accent1, "2563EB");
    let accent = normHex(extracted.colors.accent2 || extracted.colors.accent1, primary);
    if (extracted.slideColors.length > 0) {
      const dominant = extracted.slideColors[0].hex;
      primary = dominant;
      const second = extracted.slideColors[1];
      accent = second && colorDistance(dominant, second.hex) > 60 ? second.hex : dominant;
    }

    const brand = {
      name: extracted.name,
      roles: { primary, dark, accent, surface },
      fontHead: extracted.fontHead,
      fontBody: extracted.fontBody,
      logoDataUri: extracted.logoDataUri,
    };

    return NextResponse.json({
      brand,
      palette: {
        dk1: normHex(extracted.colors.dk1, ""),
        lt1: normHex(extracted.colors.lt1, ""),
        dk2: normHex(extracted.colors.dk2, ""),
        lt2: normHex(extracted.colors.lt2, ""),
        accent1: normHex(extracted.colors.accent1, ""),
        accent2: normHex(extracted.colors.accent2, ""),
        accent3: normHex(extracted.colors.accent3, ""),
        accent4: normHex(extracted.colors.accent4, ""),
      },
    });
  } catch (err) {
    console.error("Brand extraction failed:", err);
    return NextResponse.json(
      { error: "Couldn't read that file as a PowerPoint template." },
      { status: 422 },
    );
  }
}
