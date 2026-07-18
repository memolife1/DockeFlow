"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { getTemplate } from "@/lib/templates";
import { SlideView } from "@/components/deck/SlideView";
import { ButtonLink } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Misc";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/lib/useSubscription";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevron,
} from "@/components/ui/icons";

export default function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ready, getPresentation, slidesFor, templates, getBrandLogos } = useStore();
  const { subscription } = useSubscription();
  const presentation = getPresentation(id);
  const slides = slidesFor(id);
  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(false);

  const uploaded = useMemo(
    () => templates.filter((t) => t.sourceType === "uploaded"),
    [templates],
  );
  const theme =
    (presentation && getTemplate(presentation.templateId, uploaded)?.theme) ??
    templates[0].theme;
  const logoWatermark = presentation?.logoWatermark;
  const logoDataUri = logoWatermark
    ? getBrandLogos().find((l) => l.id === logoWatermark.logoId)?.dataUri
    : undefined;

  const go = useCallback(
    (dir: number) =>
      setI((cur) => Math.min(slides.length - 1, Math.max(0, cur + dir))),
    [slides.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key.toLowerCase() === "n") setNotes((n) => !n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Spinner className="text-white" />
      </div>
    );
  }

  if (!presentation || slides.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink text-paper">
        <p className="text-paper/70">Nothing to preview yet.</p>
        <ButtonLink href="/dashboard" variant="secondary">
          Back to dashboard
        </ButtonLink>
      </div>
    );
  }

  const current = slides[i];

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between px-4 text-paper">
        <Link
          href={`/presentations/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-paper/70 hover:bg-white/10 hover:text-white"
        >
          <IconArrowLeft className="h-4 w-4" /> Back to editor
        </Link>
        <p className="truncate px-4 text-sm font-medium text-paper/90">
          {presentation.title}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNotes((n) => !n)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
              notes ? "bg-white/15 text-white" : "text-paper/60 hover:text-white",
            )}
          >
            Notes
          </button>
          <span className="text-[13px] tabular-nums text-paper/60">
            {i + 1} / {slides.length}
          </span>
        </div>
      </header>

      {/* Stage */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-5xl">
          <div className="overflow-hidden rounded-xl shadow-pop ring-1 ring-white/10">
            <SlideView
              slide={current}
              theme={theme}
              themeOverrides={presentation?.themeOverrides}
              index={i}
              total={slides.length}
              logoWatermark={logoWatermark}
              logoDataUri={logoDataUri}
              showDefaultBrandMark={subscription.features.watermark}
            />
          </div>

          {notes && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-paper/80">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-paper/40">
                Speaker notes
              </p>
              {current.speakerNotes || (
                <span className="text-paper/40">No notes for this slide.</span>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => go(-1)}
              disabled={i === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-paper/80 hover:bg-white/10 disabled:opacity-30"
            >
              <IconChevron className="h-4 w-4 rotate-180" /> Prev
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((s, idx) => (
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
              disabled={i === slides.length - 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-paper/80 hover:bg-white/10 disabled:opacity-30"
            >
              Next <IconArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-center text-[12px] text-paper/40">
            Use ← → to navigate · press N for notes
          </p>
        </div>
      </div>
    </div>
  );
}
