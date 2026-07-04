"use client";

import Link from "next/link";
import { useState } from "react";
import type { Presentation, Slide, Template } from "@/lib/types";
import { SlideThumb } from "@/components/deck/SlideView";
import { Badge } from "@/components/ui/Misc";
import { relativeTime } from "@/lib/utils";
import { IconCopy, IconTrash, IconPlay } from "@/components/ui/icons";

const STATUS_TONE = {
  draft: "neutral",
  generating: "amber",
  ready: "green",
  error: "accent",
} as const;

export function PresentationCard({
  presentation,
  slides,
  template,
  onDelete,
  onDuplicate,
}: {
  presentation: Presentation;
  slides: Slide[];
  template?: Template;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const first = slides[0];
  const theme = template?.theme;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-paper shadow-card transition-shadow hover:shadow-raised">
      <Link href={`/presentations/${presentation.id}/edit`} className="block">
        <div className="border-b border-line bg-paper-sunk p-4">
          {first && theme ? (
            <SlideThumb slide={first} theme={theme} />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center rounded-md border border-dashed border-line-strong bg-paper text-sm text-ink-faint">
              No slides yet
            </div>
          )}
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <Link href={`/presentations/${presentation.id}/edit`}>
            <h3 className="truncate text-sm font-semibold text-ink hover:text-accent">
              {presentation.title}
            </h3>
          </Link>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone={STATUS_TONE[presentation.status]}>
              {presentation.status}
            </Badge>
            <span className="text-[12px] text-ink-muted">
              {slides.length} slides · {relativeTime(presentation.updatedAt)}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenu((m) => !m)}
            onBlur={() => setTimeout(() => setMenu(false), 120)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-paper-sunk hover:text-ink"
            aria-label="Actions"
          >
            <span className="text-lg leading-none">⋯</span>
          </button>
          {menu && (
            <div className="absolute right-0 top-8 z-10 w-40 overflow-hidden rounded-lg border border-line bg-paper py-1 shadow-pop">
              <Link
                href={`/presentations/${presentation.id}/preview`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-paper-sunk"
              >
                <IconPlay className="h-4 w-4" /> Preview
              </Link>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  onDuplicate();
                  setMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-paper-sunk"
              >
                <IconCopy className="h-4 w-4" /> Duplicate
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  onDelete();
                  setMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <IconTrash className="h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
