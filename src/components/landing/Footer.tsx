import Link from "next/link";

const LINK_STYLE = { color: "var(--ink-light)" };

export function Footer() {
  return (
    <footer className="px-5 py-16 md:px-8" style={{ background: "var(--bg-dark)" }}>
      <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <p className="text-base font-bold text-white">DeckeFlow</p>
          <p className="mt-3 text-sm" style={LINK_STYLE}>
            Sharjah, UAE
          </p>
          <a href="mailto:hello@deckeflow.com" className="mt-1 block text-sm hover:text-white" style={LINK_STYLE}>
            hello@deckeflow.com
          </a>
        </div>

        <div>
          <p className="lp-eyebrow" style={{ color: "var(--ink-light)" }}>
            Product
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/#pricing" className="hover:text-white" style={LINK_STYLE}>
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/templates" className="hover:text-white" style={LINK_STYLE}>
                Templates
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white" style={LINK_STYLE}>
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="lp-eyebrow" style={{ color: "var(--ink-light)" }}>
            Company
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white" style={LINK_STYLE}>
                About
              </Link>
            </li>
            <li>
              <a href="mailto:hello@deckeflow.com" className="hover:text-white" style={LINK_STYLE}>
                Contact
              </a>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white" style={LINK_STYLE}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white" style={LINK_STYLE}>
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="mx-auto mt-12 max-w-[1000px] border-t pt-6"
        style={{ borderColor: "var(--line-dark)" }}
      >
        <p className="text-xs" style={LINK_STYLE}>
          © 2026 DeckeFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
