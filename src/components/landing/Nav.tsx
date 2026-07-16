"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-colors duration-200"
      style={{
        background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : undefined,
        boxShadow: scrolled ? "0 1px 0 var(--line)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/deckeflow-logo.png"
            alt="DeckeFlow"
            width={137}
            height={24}
            priority
          />
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="px-4 py-2 text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            Start free →
          </Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center md:hidden"
          style={{ color: "var(--ink)" }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div
          className="border-t px-5 py-4 md:hidden"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        >
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-3 text-center text-sm font-semibold"
              style={{ color: "var(--ink)", border: "1px solid var(--line)" }}
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-4 py-3 text-center text-sm font-bold text-white"
              style={{ background: "var(--accent)" }}
              onClick={() => setOpen(false)}
            >
              Start free →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
