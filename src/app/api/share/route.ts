import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Slide, TemplateTheme } from "@/lib/types";

export const runtime = "nodejs";

interface ShareBody {
  presentationId?: string;
  slides?: Slide[];
  theme?: TemplateTheme;
  title?: string;
}

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Sharing isn't configured for this deployment." },
      { status: 500 },
    );
  }

  let body: ShareBody;
  try {
    body = (await req.json()) as ShareBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { presentationId, slides, theme, title } = body;
  if (!presentationId || !slides?.length || !theme || !title) {
    return NextResponse.json({ error: "Nothing to share" }, { status: 400 });
  }

  const supabase = createClient(url, key);
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  const { error } = await supabase.from("shared_decks").insert({
    token,
    presentation_id: presentationId,
    title,
    slides_json: JSON.stringify(slides),
    theme_json: JSON.stringify(theme),
    expires_at: expiresAt,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  return NextResponse.json({ url: `${baseUrl}/share/${token}` });
}
