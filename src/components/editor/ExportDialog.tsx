"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Misc";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { IconDoc, IconDeck, IconCheck } from "@/components/ui/icons";
import type { ExportJob } from "@/lib/types";

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
  const { createExportJob } = useStore();
  const [format, setFormat] = useState<ExportJob["format"]>("pdf");
  const [state, setState] = useState<"idle" | "processing" | "ready">("idle");

  const run = async () => {
    setState("processing");
    createExportJob(presentationId, format);
    try {
      await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentationId, format }),
      });
    } catch {
      /* mocked — ignore */
    }
    setState("ready");
  };

  const close = () => {
    onClose();
    setTimeout(() => setState("idle"), 200);
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
            Export prepared ({format.toUpperCase()})
          </p>
          <p className="mt-1 max-w-xs text-[13px] text-ink-muted">
            Export is mocked in this MVP. In production this delivers a real
            file — the rendering pipeline plugs in behind the same button.
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
        </div>
      )}
    </Modal>
  );
}
