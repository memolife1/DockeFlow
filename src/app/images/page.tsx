"use client";

import { useRef, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/Misc";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { IconImage, IconUpload, IconTrash } from "@/components/ui/icons";

const ACCEPT = ".jpg,.jpeg,.png,.webp";
const MAX_BYTES = 10 * 1024 * 1024;

export default function ImagesPage() {
  const { addUserImage, removeUserImage, getUserImages } = useStore();
  const images = getUserImages();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    setError("");
    const list = Array.from(files).filter((f) =>
      /\.(jpe?g|png|webp)$/i.test(f.name),
    );
    if (list.length === 0) {
      setError("Only .jpg, .jpeg, .png, and .webp images are supported.");
      return;
    }
    const oversized = list.find((f) => f.size > MAX_BYTES);
    if (oversized) {
      setError(`${oversized.name} is over the 10MB limit.`);
      return;
    }
    setUploading(true);
    try {
      for (const file of list) await addUserImage(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <PageHeader
          title="My Images"
          subtitle="Upload photos to use in your presentations instead of stock images."
        />

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
            {uploading ? "Uploading…" : "Drop photos here, or click to choose files"}
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            JPG, PNG, or WebP — up to 10MB each
          </p>
          {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}
        </div>

        <div className="mt-8">
          {images.length === 0 ? (
            <EmptyState
              icon={<IconImage className="h-5 w-5" />}
              title="No images yet"
              body="Upload some to use them in your slides."
            />
          ) : (
            <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {images.map((img) => (
                <div key={img.id} className="group relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-paper-sunk">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.dataUri || img.fileUrl}
                      alt={img.fileName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-1.5 truncate text-[12px] text-ink-muted">
                    {img.fileName}
                  </p>
                  <button
                    onClick={() => removeUserImage(img.id)}
                    aria-label={`Delete ${img.fileName}`}
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
