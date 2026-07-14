"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Misc";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { IconDoc, IconDeck, IconCheck } from "@/components/ui/icons";
import type { ExportJob } from "@/lib/types";
import { exportDeckToPptx } from "@/lib/pptx";
import { getTemplate, BUILT_IN_TEMPLATES } from "@/lib/templates";
import { IconCopy } from "@/components/ui/icons";

const FORMATS: {
  value: ExportJob["format"];
  label: string;
  sub: string;
  icon: typeof IconDoc;
}[] = [
  { value: "pdf", label: "PDF", sub: "Best for sharing & review", icon: IconDoc },
  { value: "pptx", label: "PowerPoint", sub: "Editable .pptx file", icon: IconDeck },
  { value: "link", label: "Share link", sub: "Read-only web preview", icon: IconDeck },
];

export function ExportDialog({
  open,
  onClose,
  presentationId,
  title,
}: {
  open: boolean;
  onClose: () => void;
  presentationId: string;
  title: string;
}) {
  const { createExportJob, getPresentation, slidesFor, templates, getBrandLogos } = useStore();
  const [format, setFormat] = useState<ExportJob["format"]>("pptx");
  const [state, setState] = useState<"idle" | "processing" | "ready" | "error">(
    "idle",
  );
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setState("processing");
    setShareUrl("");
    setCopied(false);
    createExportJob(presentationId, format);
    try {
      const pres = getPresentation(presentationId);
      const slides = slidesFor(presentationId);
      if (!pres || slides.length === 0) throw new Error("Nothing to export");
      const uploaded = templates.filter((t) => t.sourceType === "uploaded");
      const template =
        getTemplate(pres.templateId, uploaded) ?? BUILT_IN_TEMPLATES[0];

      if (format === "pptx") {
        // Resolve slide images to data URIs via the server proxy so they can
        // be embedded. Silent fallback (solid theme fill) on any failure.
        const imageData: Record<string, string> = {};
        const urls = [...new Set(slides.map((s) => s.imageUrl).filter(Boolean))] as string[];
        await Promise.all(
          urls.map(async (url) => {
            try {
              const res = await fetch(`/api/stock-image?src=${encodeURIComponent(url)}`);
              const data = (await res.json()) as { image: string | null };
              if (data.image) imageData[url] = data.image;
            } catch {
              /* solid fallback */
            }
          }),
        );

        // Builds a real .pptx (with native charts) and downloads it.
        const logoDataUri = pres.logoWatermark
          ? getBrandLogos().find((l) => l.id === pres.logoWatermark?.logoId)?.dataUri
          : undefined;
        await exportDeckToPptx(pres, slides, template.theme, { imageData, logoDataUri });
      } else if (format === "pdf") {
        const { exportDeckToPdf } = await import("@/lib/exportPdf");
        const logoDataUri = pres.logoWatermark
          ? getBrandLogos().find((l) => l.id === pres.logoWatermark?.logoId)?.dataUri
          : undefined;
        await exportDeckToPdf(pres, slides, template.theme, logoDataUri);
      } else {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presentationId,
            slides,
            theme: template.theme,
            title: pres.title,
          }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!data.url) throw new Error(data.error || "Couldn't create a share link");
        setShareUrl(data.url);
        try {
          await navigator.clipboard.writeText(data.url);
          setCopied(true);
        } catch {
          /* clipboard permission denied — URL is still shown for manual copy */
        }
      }
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const close = () => {
    onClose();
    setTimeout(() => {
      setState("idle");
      setShareUrl("");
      setCopied(false);
    }, 200);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Export presentation"
      description={
        state === "ready"
          ? undefined
          : `Choose a format for “${title}”.`
      }
      footer={
        state === "ready" ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={run} disabled={state === "processing"}>
              {state === "processing" ? <Spinner /> : "Export"}
            </Button>
          </>
        )
      }
    >
      {state === "ready" ? (
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <IconCheck className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-ink">
            {format === "pptx"
              ? "Your presentation downloaded (.pptx)"
              : format === "pdf"
              ? "Your presentation downloaded (.pdf)"
              : "Share link created"}
          </p>
          <p className="mt-1 max-w-xs text-[13px] text-ink-muted">
            {format === "pptx"
              ? "An editable PowerPoint file with native charts on data slides. Check your downloads."
              : format === "pdf"
              ? "A print-ready PDF snapshot of every slide. Check your downloads."
              : copied
              ? "Copied to your clipboard — valid for 30 days."
              : "Valid for 30 days. Copy the link below to share it."}
          </p>
          {format === "link" && shareUrl && (
            <div className="mt-4 flex w-full max-w-xs items-center gap-2 rounded-lg border border-line bg-paper-soft px-3 py-2">
              <input
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 truncate bg-transparent text-[12px] text-ink-muted outline-none"
              />
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                  } catch {
                    /* ignore */
                  }
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-paper-sunk hover:text-ink"
                aria-label="Copy link"
                title="Copy link"
              >
                <IconCopy className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : state === "error" ? (
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <IconDoc className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-ink">Export failed</p>
          <p className="mt-1 max-w-xs text-[13px] text-ink-muted">
            Something went wrong building the file. Please try again.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                format === f.value
                  ? "border-accent bg-accent-soft"
                  : "border-line hover:bg-paper-soft",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md",
                  format === f.value
                    ? "bg-accent text-white"
                    : "bg-paper-sunk text-ink-soft",
                )}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{f.label}</p>
                <p className="text-[12px] text-ink-muted">{f.sub}</p>
              </div>
              {format === f.value && (
                <IconCheck className="h-4 w-4 text-accent" />
              )}
            </button>
          ))}
          <p className="pt-1 text-[12px] text-ink-muted">
            Export produces native editable PowerPoint objects — text, shapes,
            and charts stay fully editable in PowerPoint.
          </p>
        </div>
      )}
    </Modal>
  );
}
