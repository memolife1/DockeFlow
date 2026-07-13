"use client";

import { use, useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { SlideView } from "@/components/deck/SlideView";
import { Spinner } from "@/components/ui/Misc";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { IconArrowRight, IconChevron } from "@/components/ui/icons";
import type { Slide, TemplateTheme } from "@/lib/types";

interface SharedDeck {
  title: string;
  slides: Slide[];
  theme: TemplateTheme;
}

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [deck, setDeck] = useState<SharedDeck | null>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (active) setState("error");
        return;
      }
      const { data, error } = await supabase
        .from("shared_decks")
        .select("title, slides_json, theme_json, expires_at")
        .eq("token", token)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        setState("error");
        return;
      }
      try {
        setDeck({
          title: data.title,
          slides: JSON.parse(data.slides_json),
          theme: JSON.parse(data.theme_json),
        });
        setState("ready");
      } catch {
        setState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const go = useCallback(
    (dir: number) =>
      setI((cur) =>
        deck ? Math.min(deck.slides.length - 1, Math.max(0, cur + dir)) : cur,
      ),
    [deck],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Spinner className="text-white" />
      </div>
    );
  }

  if (state === "error" || !deck) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink text-center text-paper">
        <p className="text-paper/70">
          This link has expired or no longer exists.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-paper/80 hover:text-white"
        >
          Build your own deck <IconArrowRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  const current = deck.slides[i];

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="flex h-14 shrink-0 items-center justify-between px-4 text-paper">
        <div className="opacity-80">
          <Logo compact />
        </div>
        <p className="truncate px-4 text-sm font-medium text-paper/90">
          {deck.title}
        </p>
        <span className="text-[13px] tabular-nums text-paper/60">
          {i + 1} / {deck.slides.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-5xl">
          <div className="overflow-hidden rounded-xl shadow-pop ring-1 ring-white/10">
            <SlideView
              slide={current}
              theme={deck.theme}
              index={i}
              total={deck.slides.length}
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => go(-1)}
              disabled={i === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-paper/80 hover:bg-white/10 disabled:opacity-30"
            >
              <IconChevron className="h-4 w-4 rotate-180" /> Prev
            </button>

            <div className="flex items-center gap-1.5">
              {deck.slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setI(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    idx === i ? "w-6 bg-accent" : "w-2 bg-white/25 hover:bg-white/40",
                  )}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              disabled={i === deck.slides.length - 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-paper/80 hover:bg-white/10 disabled:opacity-30"
            >
              Next <IconArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-center text-[12px] text-paper/40">
            Use ← → to navigate · read-only preview
          </p>
        </div>
      </div>
    </div>
  );
}
