"use client";

import { useState } from "react";
import type { Slide, TemplateTheme } from "@/lib/types";
import { SlideThumb } from "@/components/deck/SlideView";
import { cn } from "@/lib/utils";
import { IconPlus, IconDrag } from "@/components/ui/icons";

export function SlideRail({
  slides,
  theme,
  selectedId,
  onSelect,
  onAdd,
  onReorder,
}: {
  slides: Slide[];
  theme: TemplateTheme;
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onReorder: (from: number, to: number) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  return (
    <div className="thin-scroll flex h-full flex-col overflow-y-auto border-r border-line bg-paper">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
          {slides.length} slides
        </span>
        <button
          onClick={onAdd}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:bg-paper-sunk hover:text-ink"
          aria-label="Add slide"
          title="Add slide"
        >
          <IconPlus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-2 p-3">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(i);
            }}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i);
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={cn(
              "group relative flex gap-2 rounded-lg border p-1.5 transition-all",
              slide.id === selectedId
                ? "border-accent bg-accent-soft"
                : "border-transparent hover:border-line hover:bg-paper-soft",
              overIndex === i && dragIndex !== null && dragIndex !== i
                ? "ring-2 ring-accent-ring"
                : "",
              dragIndex === i ? "opacity-40" : "",
            )}
          >
            <div className="flex flex-col items-center pt-1">
              <span className="text-[11px] font-semibold tabular-nums text-ink-muted">
                {i + 1}
              </span>
              <IconDrag className="mt-1 h-4 w-4 cursor-grab text-ink-faint opacity-0 group-hover:opacity-100" />
            </div>
            <button
              onClick={() => onSelect(slide.id)}
              className="min-w-0 flex-1 text-left"
            >
              <SlideThumb slide={slide} theme={theme} />
            </button>
          </div>
        ))}

        <button
          onClick={onAdd}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong py-2.5 text-[13px] font-medium text-ink-muted hover:border-accent hover:text-accent"
        >
          <IconPlus className="h-4 w-4" /> Add slide
        </button>
      </div>
    </div>
  );
}
