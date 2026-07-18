"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/Misc";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { IconBadge, IconUpload, IconTrash, IconCheck } from "@/components/ui/icons";
import { padLogoTo200x100 } from "@/lib/padLogo";

const ACCEPT = ".png,.svg,.jpg,.jpeg";
const MAX_BYTES = 2 * 1024 * 1024;

export default function LogosPage() {
  return (
    <Suspense fallback={null}>
      <LogosPageInner />
    </Suspense>
  );
}

function LogosPageInner() {
  const { addBrandLogo, removeBrandLogo, getBrandLogos } = useStore();
  const logos = getBrandLogos();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [justUploadedIds, setJustUploadedIds] = useState<Set<string>>(new Set());

  const handleFiles = async (files: FileList | File[]) => {
    setError("");
    const list = Array.from(files).filter((f) => /\.(png|svg|jpe?g)$/i.test(f.name));
    if (list.length === 0) {
      setError("Only .png, .svg, and .jpg logos are supported.");
      return;
    }
    const oversized = list.find((f) => f.size > MAX_BYTES);
    if (oversized) {
      setError(`${oversized.name} is over the 2MB limit.`);
      return;
    }
    setUploading(true);
    try {
      for (const file of list) {
        const { blob } = await padLogoTo200x100(file);
        const mime = file.type === "image/svg+xml" ? "image/svg+xml" : "image/png";
        const ext = mime === "image/svg+xml" ? "svg" : "png";
        const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
        const padded = new File([blob], name, { type: mime });
        const logo = await addBrandLogo(padded);
        setJustUploadedIds((prev) => new Set(prev).add(logo.id));
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <PageHeader
          title="Brand Logos"
          subtitle="Upload your logo to watermark it onto every slide."
        />

        {returnTo && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-accent/20 bg-accent-soft px-4 py-3">
            <span className="text-sm font-medium text-accent">
              Upload your logo here, then return to continue creating your presentation.
            </span>
            <button
              onClick={() => router.push(returnTo)}
              className="ml-4 shrink-0 rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              ← Back to presentation
            </button>
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            drag ? "border-accent bg-accent-soft" : "border-line-strong bg-paper-soft",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink-muted shadow-card">
            <IconUpload className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-ink">
            {uploading ? "Uploading…" : "Drop logos here, or click to choose files"}
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">PNG, SVG, or JPG — up to 2MB each</p>
          {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}
        </div>

        <p className="mt-3 text-[12px] text-ink-faint">
          Logos are auto-cropped/padded to a fixed size (200×100 px); transparent backgrounds
          are preserved.
        </p>

        {returnTo && justUploadedIds.size > 0 && (
          <button
            onClick={() => router.push(returnTo)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            <IconCheck className="h-4 w-4" /> Logo saved — Back to presentation →
          </button>
        )}

        <div className="mt-8">
          {logos.length === 0 ? (
            <EmptyState
              icon={<IconBadge className="h-5 w-5" />}
              title="No logos yet"
              body="Upload one to watermark it onto your slides."
            />
          ) : (
            <div
              className="grid grid-cols-2 gap-4 rounded-xl p-4 sm:grid-cols-4 md:grid-cols-6"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            >
              {logos.map((logo) => (
                <div key={logo.id} className="group relative">
                  <div className="flex aspect-[2/1] items-center justify-center overflow-hidden rounded-lg border border-line bg-white/40 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo.dataUri}
                      alt={logo.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="mt-1.5 truncate text-[12px] text-ink-muted">{logo.name}</p>
                  {justUploadedIds.has(logo.id) && (
                    <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
                      <IconCheck className="h-2.5 w-2.5" /> Saved
                    </span>
                  )}
                  <button
                    onClick={() => removeBrandLogo(logo.id)}
                    aria-label={`Delete ${logo.name}`}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-ink/70 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-ink/90"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
