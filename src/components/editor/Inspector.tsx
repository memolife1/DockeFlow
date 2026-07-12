"use client";

import type { LayoutType, Slide } from "@/lib/types";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { IconPlus, IconTrash, IconCopy } from "@/components/ui/icons";
import { resolveLayoutId } from "@/lib/layouts/specs";

const LAYOUTS: { value: LayoutType; label: string }[] = [
  { value: "title_hero", label: "Title — hero" },
  { value: "title_split", label: "Title — split panel" },
  { value: "agenda", label: "Agenda" },
  { value: "section_divider", label: "Section divider" },
  { value: "content_bullets", label: "Content — bullets" },
  { value: "content_image_right", label: "Content — image right" },
  { value: "content_image_left", label: "Content — image left" },
  { value: "two_column_compare", label: "Two-column compare" },
  { value: "stat_kpi", label: "Stat / KPI cards" },
  { value: "timeline_horizontal", label: "Timeline" },
  { value: "process_steps", label: "Process steps" },
  { value: "funnel", label: "Funnel" },
  { value: "swot_matrix", label: "SWOT matrix" },
  { value: "chart_focus", label: "Chart focus" },
  { value: "team_grid", label: "Team grid" },
  { value: "closing_cta", label: "Closing / next steps" },
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
            value={resolveLayoutId(slide)}
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
