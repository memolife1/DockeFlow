import { NextResponse } from "next/server";
import { extractBrandFromPptx } from "@/lib/brandExtract";
import { contrast, normHex } from "@/lib/layouts/theme";

export const runtime = "nodejs";

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

    const dk = normHex(extracted.colors.dk1, "1A1B21");
    const lt = normHex(extracted.colors.lt1, "FFFFFF");
    // dk2 is usually the "real" dark brand color; dk1 is often near-black text.
    let dark = normHex(extracted.colors.dk2 || extracted.colors.dk1, "1A1B21");
    if (contrast("FFFFFF", dark) < 4.5) dark = normHex(extracted.colors.dk1, "10151E");
    const primary = normHex(extracted.colors.accent1, "2563EB");
    const accent = normHex(extracted.colors.accent2 || extracted.colors.accent1, primary);
    const surface = contrast(lt, "000000") > 1.2 ? lt : "FFFFFF";

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
