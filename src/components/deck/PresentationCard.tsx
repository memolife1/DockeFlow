"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Presentation, Slide, Template } from "@/lib/types";
import { SlideThumb } from "@/components/deck/SlideView";
import { Badge } from "@/components/ui/Misc";
import { relativeTime } from "@/lib/utils";
import { IconCopy, IconTrash, IconPlay, IconGrid, IconDownload } from "@/components/ui/icons";

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
  onRename,
  onExport,
}: {
  presentation: Presentation;
  slides: Slide[];
  template?: Template;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (title: string) => void;
  onExport: () => void;
}) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(presentation.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const first = slides[0];
  const theme = template?.theme;
  const editHref = `/presentations/${presentation.id}/edit`;

  const commitRename = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== presentation.title) onRename(trimmed);
    else setTitleDraft(presentation.title);
    setRenaming(false);
  };

  return (
    <div
      onClick={() => {
        if (!renaming) router.push(editHref);
      }}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-line bg-paper shadow-card transition-shadow hover:shadow-raised"
    >
      <div className="overflow-hidden rounded-t-xl border-b border-line bg-paper-sunk p-4">
        {first && theme ? (
          <SlideThumb slide={first} theme={theme} />
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center rounded-md border border-dashed border-line-strong bg-paper text-sm text-ink-faint">
            No slides yet
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          {renaming ? (
            <input
              ref={inputRef}
              autoFocus
              value={titleDraft}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setTitleDraft(presentation.title);
                  setRenaming(false);
                }
              }}
              className="w-full truncate rounded-md border border-accent bg-paper px-1.5 py-0.5 text-sm font-semibold text-ink focus:outline-none"
            />
          ) : (
            <h3 className="truncate text-sm font-semibold text-ink group-hover:text-accent">
              {presentation.title}
            </h3>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone={STATUS_TONE[presentation.status]}>
              {presentation.status}
            </Badge>
            <span className="text-[12px] text-ink-muted">
              {slides.length} slides · {relativeTime(presentation.updatedAt)}
            </span>
          </div>
        </div>

        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenu((m) => !m)}
            onBlur={() => setTimeout(() => setMenu(false), 120)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-paper-sunk hover:text-ink"
            aria-label="Actions"
          >
            <span className="text-lg leading-none">⋯</span>
          </button>
          {menu && (
            <div className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-lg border border-line bg-paper py-1 shadow-pop">
              <Link
                href={editHref}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-paper-sunk"
              >
                <IconGrid className="h-4 w-4" /> Edit
              </Link>
              <Link
                href={`/presentations/${presentation.id}/preview`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-paper-sunk"
              >
                <IconPlay className="h-4 w-4" /> Preview
              </Link>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setMenu(false);
                  setTitleDraft(presentation.title);
                  setRenaming(true);
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-soft hover:bg-paper-sunk"
              >
                Rename
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  onExport();
                  setMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-paper-sunk"
              >
                <IconDownload className="h-4 w-4" /> Export
              </button>
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
