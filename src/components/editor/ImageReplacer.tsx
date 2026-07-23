"use client";

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { IconX } from "@/components/ui/icons";

interface PexelsPhoto {
  id: number;
  src: { large2x?: string; medium?: string };
  photographer?: string;
  alt?: string;
}

const CATEGORIES = [
  "business",
  "team",
  "office",
  "technology",
  "meeting",
  "city",
  "nature",
  "architecture",
];

export function ImageReplacer({
  currentUrl,
  onSelect,
}: {
  currentUrl?: string;
  onSelect: (url: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    try {
      const session = supabase ? (await supabase.auth.getSession()).data.session : null;
      const res = await fetch(`/api/pexels/search?q=${encodeURIComponent(q)}&per_page=9`, {
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      const data = (await res.json()) as { photos?: PexelsPhoto[]; error?: string };
      if (!res.ok) {
        setError(data.error || "Search failed. Please try again.");
        setResults([]);
        return;
      }
      setResults(data.photos ?? []);
    } catch {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-2">
      {currentUrl ? (
        <div className="group relative aspect-video overflow-hidden rounded-lg border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt="Slide image" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40"
          >
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-ink opacity-0 transition-opacity group-hover:opacity-100">
              Replace image
            </span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-lg border-2 border-dashed border-line py-4 text-[13px] text-ink-muted hover:border-accent hover:text-accent"
        >
          + Add image
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-paper shadow-pop">
            <div className="border-b border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-ink">Replace image</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-ink-muted hover:text-ink"
                  aria-label="Close"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search Pexels (e.g. 'modern office', 'teamwork')…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search(query)}
                  className="flex-1 rounded-lg border border-line px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => search(query)}
                  disabled={loading}
                  className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
                >
                  {loading ? "…" : "Search"}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setQuery(cat);
                      search(cat);
                    }}
                    className="rounded-full border border-line px-3 py-1 text-[11px] text-ink-muted hover:border-accent hover:text-accent"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-3">
              {error && <p className="py-2 text-center text-[12px] text-red-500">{error}</p>}
              {results.length === 0 && !loading && !error && (
                <p className="py-8 text-center text-[13px] text-ink-muted">
                  Search for an image to replace the current one
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {results.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => {
                      const url = photo.src.large2x ?? photo.src.medium;
                      if (url) onSelect(url);
                      setOpen(false);
                    }}
                    className="aspect-video overflow-hidden rounded-lg border-2 border-transparent hover:border-accent"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src.medium}
                      alt={photo.alt ?? ""}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
              {results.length > 0 && (
                <p className="mt-3 text-center text-[10px] text-ink-faint">Photos by Pexels</p>
              )}
            </div>

            <div className="border-t border-line p-3">
              <button
                type="button"
                onClick={() => {
                  onSelect("");
                  setOpen(false);
                }}
                className="text-[12px] text-red-500 hover:text-red-600"
              >
                Remove image from this slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
