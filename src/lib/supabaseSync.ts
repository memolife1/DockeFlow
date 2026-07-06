import { supabase } from "./supabase";
import type { Presentation, Slide } from "./types";

// Maps between the app's Presentation + Slide[] and a single `presentations`
// row (slides stored as JSON). All functions are safe no-ops when Supabase is
// not configured or there is no signed-in user.

interface Row {
  id: string;
  user_id: string;
  title: string;
  subtitle: string;
  mode: string;
  audience: string;
  goal: string;
  tone: string;
  template: string;
  status: string;
  slides: Slide[];
  created_at: string;
  updated_at: string;
}

export async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function savePresentationRemote(
  presentation: Presentation,
  slides: Slide[],
): Promise<void> {
  if (!supabase) return;
  const userId = await currentUserId();
  if (!userId) return;
  const row = {
    id: presentation.id,
    user_id: userId,
    title: presentation.title,
    subtitle: presentation.subtitle ?? "",
    mode: presentation.mode,
    audience: presentation.audience ?? "",
    goal: presentation.goal ?? "",
    tone: presentation.tone,
    template: presentation.templateId,
    status: presentation.status,
    slides,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("presentations")
    .upsert(row, { onConflict: "id" });
  if (error) console.error("Supabase save failed:", error.message);
}

export async function deletePresentationRemote(id: string): Promise<void> {
  if (!supabase) return;
  const userId = await currentUserId();
  if (!userId) return;
  const { error } = await supabase.from("presentations").delete().eq("id", id);
  if (error) console.error("Supabase delete failed:", error.message);
}

export interface RemoteDeck {
  presentation: Presentation;
  slides: Slide[];
}

export async function loadPresentationsRemote(): Promise<RemoteDeck[]> {
  if (!supabase) return [];
  const userId = await currentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from("presentations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("Supabase load failed:", error.message);
    return [];
  }
  return (data as Row[]).map((r) => ({
    presentation: {
      id: r.id,
      userId: r.user_id,
      title: r.title,
      subtitle: r.subtitle ?? "",
      mode: (r.mode as Presentation["mode"]) ?? "topic",
      audience: r.audience ?? "",
      goal: r.goal ?? "",
      tone: (r.tone as Presentation["tone"]) ?? "professional",
      templateId: r.template ?? "",
      status: (r.status as Presentation["status"]) ?? "ready",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    },
    slides: Array.isArray(r.slides) ? r.slides : [],
  }));
}
