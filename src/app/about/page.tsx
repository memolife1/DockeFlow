import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — DeckeFlow",
};

export default function AboutPage() {
  return (
    <div className="lp min-h-screen px-5 py-16 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
          ← Back to DeckeFlow
        </Link>
        <h1 className="mt-6 text-3xl" style={{ color: "var(--ink)" }}>
          About DeckeFlow
        </h1>
        <p className="mt-4 text-[15px]" style={{ color: "var(--ink-muted)" }}>
          DeckeFlow turns raw notes into executive-quality presentations for professionals who
          present for a living. Based in Sharjah, UAE. Reach us at{" "}
          <a href="mailto:hello@deckeflow.com" style={{ color: "var(--accent)" }}>
            hello@deckeflow.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
