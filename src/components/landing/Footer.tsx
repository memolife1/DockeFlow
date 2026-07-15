import Link from "next/link";

export function Footer() {
  return (
    <footer className="px-5 py-10 md:px-8" style={{ background: "var(--bg-dark)", borderTop: "1px solid var(--line-dark)" }}>
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-extrabold text-white lp-display"
            style={{ background: "var(--accent)" }}
          >
            D
          </span>
          <span className="text-sm" style={{ color: "var(--ink-light)" }}>
            © 2026 DeckeFlow. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm" style={{ color: "var(--ink-light)" }}>
          <Link href="/privacy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms of Service
          </Link>
          <a href="mailto:hello@deckeflow.com" className="hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
