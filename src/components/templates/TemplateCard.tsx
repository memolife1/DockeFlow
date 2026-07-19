import type { Template } from "@/lib/types";
import { Badge } from "@/components/ui/Misc";
import { cn } from "@/lib/utils";
import { IconCheck } from "@/components/ui/icons";
import { TemplatePreview } from "@/components/templates/TemplatePreview";

export function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: Template;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-paper p-3 text-left transition-all",
        selected
          ? "border-accent ring-2 ring-accent-ring"
          : "border-line hover:border-line-strong hover:shadow-card",
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-card">
          <IconCheck className="h-3.5 w-3.5" />
        </span>
      )}
      <div className="overflow-hidden rounded-lg border border-line shadow-card">
        <TemplatePreview template={template} />
      </div>
      <div className="mt-3 px-1 pb-1">
        <div className="flex items-start justify-between gap-2">
          {/* Fixed 2-line height reserved regardless of name length — a
              template with a longer name (e.g. "Crimson Authority") wrapping
              to a 2nd line must not stretch its whole grid row taller than
              its neighbors. */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-ink">
            {template.name}
          </h3>
          {template.sourceType === "uploaded" && (
            <Badge tone="accent">Yours</Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-[12px] text-ink-muted">
          {template.theme.character}
        </p>
      </div>
    </button>
  );
}
