import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — DeckeFlow",
};

export default function PrivacyPage() {
  return (
    <div className="lp min-h-screen px-5 py-16 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
          ← Back to DeckeFlow
        </Link>
        <h1 className="lp-display mt-6 text-3xl font-extrabold" style={{ color: "var(--ink)" }}>
          Privacy Policy
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          This page is a placeholder. DeckeFlow&apos;s full privacy policy will be published here
          before general availability.
        </p>
      </div>
    </div>
  );
}
