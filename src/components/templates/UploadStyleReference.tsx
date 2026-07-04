"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Spinner } from "@/components/ui/Misc";
import { IconUpload, IconCheck } from "@/components/ui/icons";
import type { Template } from "@/lib/types";

// Deterministically derive an accent from a file name so uploads feel like
// their style was "read" from the reference. (Mocked extraction.)
const PALETTE = ["#c2410c", "#1e3a34", "#b91c1c", "#3730a3", "#0f766e", "#292524", "#7c2d12", "#155e63"];
function accentFromName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function UploadStyleReference({
  onUploaded,
}: {
  onUploaded?: (template: Template) => void;
}) {
  const { addUploadedTemplate, addStyleRef } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "reading" | "done">("idle");
  const [drag, setDrag] = useState(false);
  const [lastName, setLastName] = useState("");

  const handleFile = (file: File) => {
    setState("reading");
    setLastName(file.name);
    const accent = accentFromName(file.name);
    const url = URL.createObjectURL(file);
    // Simulate style extraction latency.
    setTimeout(() => {
      addStyleRef({
        fileName: file.name,
        fileType: file.type || "unknown",
        fileUrl: url,
        extractedAccent: accent,
      });
      const tpl = addUploadedTemplate({
        name: file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "Custom template",
        category: "Uploaded",
        description: "Your uploaded reference. Generated decks follow this style.",
        sourceType: "uploaded",
        theme: {
          accent,
          surface: "#ffffff",
          ink: "#1c1917",
          fontFamily: "sans",
          character: "Custom · from your file",
        },
      });
      setState("done");
      onUploaded?.(tpl);
    }, 1200);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        drag ? "border-accent bg-accent-soft" : "border-line-strong bg-paper-soft"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.pptx,.key,.png,.jpg,.jpeg,.svg"
        className="hidden"
        onChange={onPick}
      />

      {state === "reading" ? (
        <>
          <Spinner className="text-accent" />
          <p className="mt-3 text-sm font-medium text-ink">
            Reading style from {lastName}…
          </p>
          <p className="mt-1 text-[12px] text-ink-muted">
            Extracting colors, structure, and tone
          </p>
        </>
      ) : state === "done" ? (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <IconCheck className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-ink">
            Style reference added
          </p>
          <p className="mt-1 text-[12px] text-ink-muted">
            {lastName} is now available as a template.
          </p>
          <button
            onClick={() => {
              setState("idle");
              inputRef.current?.click();
            }}
            className="mt-3 text-[13px] font-medium text-accent hover:text-accent-hover"
          >
            Upload another
          </button>
        </>
      ) : (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink-muted shadow-card">
            <IconUpload className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-ink">
            Upload a template or style reference
          </p>
          <p className="mt-1 max-w-xs text-[13px] text-ink-muted">
            Drop a PDF, PPTX, Keynote, or image. Your decks will follow its
            look and structure.
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-4 inline-flex h-9 items-center rounded-lg border border-line-strong bg-paper px-4 text-sm font-medium text-ink hover:bg-paper-sunk"
          >
            Choose file
          </button>
        </>
      )}
    </div>
  );
}
