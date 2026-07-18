"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { getTemplate } from "@/lib/templates";
import { SlideView } from "@/components/deck/SlideView";
import { SlideRail } from "@/components/editor/SlideRail";
import { Inspector } from "@/components/editor/Inspector";
import { Logo } from "@/components/brand/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, Spinner } from "@/components/ui/Misc";
import { ExportDialog } from "@/components/editor/ExportDialog";
import { useSubscription } from "@/lib/useSubscription";
import {
  IconArrowLeft,
  IconPlay,
  IconDownload,
  IconCheck,
  IconSettings,
  IconX,
} from "@/components/ui/icons";

export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    ready,
    user,
    getPresentation,
    updatePresentation,
    slidesFor,
    templates,
    updateSlide,
    addSlide,
    duplicateSlide,
    deleteSlide,
    reorderSlides,
    getBrandLogos,
  } = useStore();

  const { subscription } = useSubscription();
  const presentation = getPresentation(id);
  const slides = slidesFor(id);
  const [selectedId, setSelectedId] = useState<string>("");
  const [exportOpen, setExportOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  const uploaded = useMemo(
    () => templates.filter((t) => t.sourceType === "uploaded"),
    [templates],
  );
  const template = presentation
    ? getTemplate(presentation.templateId, uploaded)
    : undefined;
  const theme = template?.theme ?? templates[0].theme;
  const logoWatermark = presentation?.logoWatermark;
  const logoDataUri = logoWatermark
    ? getBrandLogos().find((l) => l.id === logoWatermark.logoId)?.dataUri
    : undefined;

  // Keep a valid selection as slides change.
  useEffect(() => {
    if (slides.length === 0) return;
    if (!slides.some((s) => s.id === selectedId)) {
      setSelectedId(slides[0].id);
    }
  }, [slides, selectedId]);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  const selected = slides.find((s) => s.id === selectedId) ?? slides[0];

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="text-accent" />
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-ink-soft">This presentation could not be found.</p>
        <ButtonLink href="/dashboard" variant="secondary">
          Back to dashboard
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper-soft">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-paper px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-paper-sunk hover:text-ink"
            aria-label="Back"
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>
          <div className="hidden sm:block">
            <Logo href="/dashboard" compact />
          </div>
          <div className="mx-1 hidden h-5 w-px bg-line sm:block" />
          <input
            value={presentation.title}
            onChange={(e) => updatePresentation(id, { title: e.target.value })}
            onBlur={flashSaved}
            className="min-w-0 max-w-[42vw] truncate rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-ink hover:border-line focus:border-accent focus:bg-paper focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-[12px] text-ink-muted sm:flex">
            {saved ? (
              <>
                <IconCheck className="h-3.5 w-3.5 text-emerald-500" /> Saved
              </>
            ) : (
              <Badge tone={presentation.status === "ready" ? "green" : "neutral"}>
                {presentation.status}
              </Badge>
            )}
          </span>
          <ButtonLink
            href={`/presentations/${id}/preview`}
            variant="secondary"
            size="sm"
          >
            <IconPlay className="h-4 w-4" /> Preview
          </ButtonLink>
          <Button size="sm" onClick={() => setExportOpen(true)}>
            <IconDownload className="h-4 w-4" /> Export
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Rail */}
        <div className="hidden w-56 shrink-0 md:block">
          <SlideRail
            slides={slides}
            theme={theme}
            themeOverrides={presentation.themeOverrides}
            selectedId={selected?.id ?? ""}
            onSelect={setSelectedId}
            onAdd={() => {
              const s = addSlide(id, selected?.orderIndex);
              setSelectedId(s.id);
              flashSaved();
            }}
            onReorder={(from, to) => {
              reorderSlides(id, from, to);
              flashSaved();
            }}
          />
        </div>

        {/* Canvas */}
        <div className="flex min-w-0 flex-1 flex-col items-center justify-start overflow-auto p-4 pb-28 sm:p-6 md:justify-center md:pb-6 lg:p-10">
          {selected ? (
            <div className="w-full max-w-3xl">
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-raised">
                <SlideView
                  slide={selected}
                  theme={theme}
                  themeOverrides={presentation.themeOverrides}
                  index={selected.orderIndex}
                  total={slides.length}
                  logoWatermark={logoWatermark}
                  logoDataUri={logoDataUri}
                  showDefaultBrandMark={subscription.features.watermark}
                />
              </div>
              <p className="mt-3 text-center text-[12px] text-ink-muted">
                Editing slide {selected.orderIndex + 1} of {slides.length} ·
                changes save automatically
              </p>
            </div>
          ) : (
            <p className="text-ink-muted">No slides.</p>
          )}
        </div>

        {/* Inspector — desktop */}
        <div className="hidden w-80 shrink-0 lg:block">
          {selected && (
            <Inspector
              slide={selected}
              canDelete={slides.length > 1}
              presentation={presentation}
              theme={theme}
              onChange={(patch) => {
                updateSlide(selected.id, patch);
                flashSaved();
              }}
              onDuplicate={() => {
                duplicateSlide(selected.id);
                flashSaved();
              }}
              onDelete={() => {
                deleteSlide(selected.id);
                flashSaved();
              }}
              onUpdatePresentation={(patch) => {
                updatePresentation(id, patch);
                flashSaved();
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile slide rail — horizontal strip fixed to the bottom */}
      <div className="fixed inset-x-0 bottom-0 z-30 h-24 border-t border-line bg-paper md:hidden">
        <SlideRail
          slides={slides}
          theme={theme}
          themeOverrides={presentation.themeOverrides}
          selectedId={selected?.id ?? ""}
          onSelect={setSelectedId}
          onAdd={() => {
            const s = addSlide(id, selected?.orderIndex);
            setSelectedId(s.id);
            flashSaved();
          }}
          onReorder={(from, to) => {
            reorderSlides(id, from, to);
            flashSaved();
          }}
          orientation="horizontal"
        />
      </div>

      {/* Floating button to open the Design/Content drawer on mobile+tablet */}
      {selected && (
        <button
          onClick={() => setMobileInspectorOpen(true)}
          className="fixed bottom-28 right-4 z-30 flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop lg:hidden"
        >
          <IconSettings className="h-4 w-4" /> Design
        </button>
      )}

      {/* Inspector — mobile/tablet drawer */}
      {mobileInspectorOpen && selected && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileInspectorOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-paper shadow-pop">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                Edit slide
              </span>
              <button
                onClick={() => setMobileInspectorOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-paper-sunk hover:text-ink"
                aria-label="Close"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <Inspector
                slide={selected}
                canDelete={slides.length > 1}
                presentation={presentation}
                theme={theme}
                onChange={(patch) => {
                  updateSlide(selected.id, patch);
                  flashSaved();
                }}
                onDuplicate={() => {
                  duplicateSlide(selected.id);
                  flashSaved();
                }}
                onDelete={() => {
                  deleteSlide(selected.id);
                  flashSaved();
                }}
                onUpdatePresentation={(patch) => {
                  updatePresentation(id, patch);
                  flashSaved();
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        presentationId={id}
        title={presentation.title}
      />
    </div>
  );
}
