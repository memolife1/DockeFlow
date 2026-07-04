import type { Template } from "@/lib/types";
import { Badge } from "@/components/ui/Misc";
import { cn } from "@/lib/utils";
import { IconCheck } from "@/components/ui/icons";

// Mini slide mock rendered purely from theme tokens (no data needed).
function ThemeSwatch({ template }: { template: Template }) {
  const { theme } = template;
  const serif = theme.fontFamily === "serif";
  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-line"
      style={{ background: theme.surface }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ background: theme.accent }}
      />
      <div className="flex h-full flex-col justify-center gap-1.5 pl-5 pr-4">
        <div
          className={cn("h-2 w-3/5 rounded-sm", serif && "h-2.5")}
          style={{ background: theme.ink, opacity: 0.85 }}
        />
        <div className="h-1.5 w-2/5 rounded-sm" style={{ background: theme.accent }} />
        <div className="mt-1 space-y-1">
          <div className="h-1 w-4/5 rounded-sm bg-line-strong" />
          <div className="h-1 w-3/5 rounded-sm bg-line-strong" />
        </div>
      </div>
    </div>
  );
}

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
      <ThemeSwatch template={template} />
      <div className="mt-3 px-1 pb-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">{template.name}</h3>
          {template.sourceType === "uploaded" && (
            <Badge tone="accent">Yours</Badge>
          )}
        </div>
        <p className="mt-0.5 text-[12px] text-ink-muted">
          {template.theme.character}
        </p>
      </div>
    </button>
  );
}
