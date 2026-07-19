"use client";

import { useState } from "react";
import { FadeIn } from "./FadeIn";

// Vimeo demo video — thumbnail + play button only, no autoplay. The player
// iframe (and everything it drags in) doesn't load at all until clicked, so
// this never costs a real user any weight for a video they haven't asked for.
const VIMEO_ID = "1211174390";
const THUMBNAIL =
  "https://i.vimeocdn.com/video/2181288836-0edb66c024b71e892be646a33a6a663abc0d2045216226d729bccea53c22b688-d?f=webp&region=us";

function VideoPlayer() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-[960px]">
      {/* Outer glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[18px] blur-[20px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.4) 0%, rgba(8,145,178,0.2) 100%)",
        }}
      />

      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "#0B0F1A",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          {!playing ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 flex cursor-pointer items-center justify-center"
              aria-label="Play the DeckeFlow demo video"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={THUMBNAIL}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
              <div className="relative z-[2] flex flex-col items-center gap-4">
                <div
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/95 transition-transform duration-200 ease-out group-hover:scale-[1.08]"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M8 5.5L22 14L8 22.5V5.5Z" fill="#111827" />
                  </svg>
                </div>
                <div className="rounded-full bg-black/60 px-4 py-1.5 text-[13px] font-medium text-white backdrop-blur-[8px]">
                  Watch the demo · 2 min
                </div>
              </div>
            </button>
          ) : (
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src={`https://player.vimeo.com/video/${VIMEO_ID}?autoplay=1&color=2563eb&title=0&byline=0&portrait=0`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="DeckeFlow demo video"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoDemo() {
  return (
    <section
      className="px-5 pb-24 pt-5 md:px-8"
      style={{ background: "linear-gradient(180deg, #F7F8FC 0%, #EEF2FF 100%)" }}
    >
      <div className="mx-auto max-w-[1000px]">
        <FadeIn>
          <p className="lp-eyebrow text-center">See it in action</p>
          <h2
            className="mx-auto mt-4 max-w-2xl text-center text-3xl md:text-5xl"
            style={{ color: "var(--ink)" }}
          >
            From messy notes to boardroom deck in 8 minutes.
          </h2>
          <p className="mt-3 text-center text-base" style={{ color: "var(--ink-muted)" }}>
            Watch the full workflow — topic to export.
          </p>
          <div className="mt-12">
            <VideoPlayer />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
