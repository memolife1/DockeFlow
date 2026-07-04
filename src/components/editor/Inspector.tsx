"use client";

import type { LayoutType, Slide } from "@/lib/types";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { IconPlus, IconTrash, IconCopy } from "@/components/ui/icons";

const LAYOUTS: { value: LayoutType; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "agenda", label: "Agenda" },
  { value: "section", label: "Section divider" },
  { value: "content", label: "Content" },
  { value: "two-column", label: "Two column" },
  { value: "quote", label: "Quote" },
  { value: "closing", label: "Closing" },
];

export function Inspector({
  slide,
  onChange,
  onDuplicate,
  onDelete,
  canDelete,
}: {
  slide: Slide;
  onChange: (patch: Partial<Slide>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const setLine = (i: number, value: string) => {
    const content = [...slide.content];
    content[i] = value;
    onChange({ content });
  };
  const addLine = () => onChange({ content: [...slide.content, ""] });
  const removeLine = (i: number) =>
    onChange({ content: slide.content.filter((_, idx) => idx !== i) });

  return (
    <div className="thin-scroll flex h-full flex-col overflow-y-auto border-l border-line bg-paper">
      <div className="border-b border-line px-5 py-3">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
          Slide {slide.orderIndex + 1}
        </span>
      </div>

      <div className="flex-1 space-y-5 p-5">
        <Field label="Layout" htmlFor="layout">
          <Select
            id="layout"
            value={slide.layoutType}
            onChange={(e) => onChange({ layoutType: e.target.value as LayoutType })}
          >
            {LAYOUTS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Title" htmlFor="stitle">
          <Textarea
            id="stitle"
            rows={2}
            value={slide.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </Field>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink-soft">
              {slide.layoutType === "title" || slide.layoutType === "section"
                ? "Subtitle"
                : "Points"}
            </span>
            <button
              onClick={addLine}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:text-accent-hover"
            >
              <IconPlus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {slide.content.map((line, i) => (
              <div key={i} className="flex items-start gap-2">
                <Input
                  value={line}
                  onChange={(e) => setLine(i, e.target.value)}
                  placeholder="Add a point…"
                />
                <button
                  onClick={() => removeLine(i)}
                  className="mt-2.5 shrink-0 text-ink-faint hover:text-red-600"
                  aria-label="Remove point"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
            {slide.content.length === 0 && (
              <p className="text-[13px] text-ink-faint">No points yet.</p>
            )}
          </div>
        </div>

        <Field label="Speaker notes" htmlFor="notes" hint="Not shown on slide">
          <Textarea
            id="notes"
            rows={4}
            value={slide.speakerNotes}
            onChange={(e) => onChange({ speakerNotes: e.target.value })}
            placeholder="What you'll say when presenting this slide…"
          />
        </Field>
      </div>

      <div className="flex items-center gap-2 border-t border-line p-4">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onDuplicate}>
          <IconCopy className="h-4 w-4" /> Duplicate
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="flex-1"
          onClick={onDelete}
          disabled={!canDelete}
        >
          <IconTrash className="h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
}
