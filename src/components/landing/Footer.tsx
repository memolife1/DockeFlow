import Link from "next/link";

const LINK_STYLE = { color: "var(--ink-light)" };

const PRODUCT_LINKS = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Templates", href: "/templates" },
  { label: "Sign in", href: "/login" },
  { label: "Create account", href: "/signup" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Refund Policy", href: "/terms#refund-policy" },
  { label: "Cookie Policy", href: "/privacy#cookies" },
];

const SUPPORT_LINKS = [
  { label: "Contact us", href: "mailto:hello@deckeflow.com" },
  {
    label: "Report an issue",
    href: "mailto:hello@deckeflow.com?subject=Bug%20report",
  },
];

// Text-based Stripe mark — accurate and legible, unlike a hand-traced logo
// path at this size, with no external asset/network request needed.
function StripeWordmark() {
  return (
    <span
      aria-label="Stripe"
      style={{
        fontSize: 15,
        fontWeight: 700,
        fontStyle: "italic",
        letterSpacing: "-0.01em",
        color: "#8792A2",
      }}
    >
      stripe
    </span>
  );
}

export function Footer() {
  return (
    <footer className="px-5 py-16 md:px-8" style={{ background: "var(--bg-dark)" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-base font-bold text-white">DeckeFlow</p>
            <p className="mt-3 max-w-[220px] text-sm leading-relaxed" style={LINK_STYLE}>
              AI-powered presentations for professionals who need results, not templates.
            </p>
            <a
              href="mailto:hello@deckeflow.com"
              className="mt-3 block text-sm hover:text-white"
              style={LINK_STYLE}
            >
              hello@deckeflow.com
            </a>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--ink-light)" }}>
              Media Craft LLC
              <br />
              30 N Gould St Ste R
              <br />
              Sheridan, WY 82801, USA
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="lp-eyebrow" style={{ color: "var(--ink-light)" }}>
              Product
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white" style={LINK_STYLE}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="lp-eyebrow" style={{ color: "var(--ink-light)" }}>
              Legal
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white" style={LINK_STYLE}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="lp-eyebrow" style={{ color: "var(--ink-light)" }}>
              Support
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white" style={LINK_STYLE}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6" style={{ borderColor: "var(--line-dark)" }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs" style={LINK_STYLE}>
              © {new Date().getFullYear()} Media Craft LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <p className="text-xs" style={{ color: "var(--ink-light)" }}>
                Payments secured by
              </p>
              <StripeWordmark />
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed" style={{ color: "var(--ink-light)" }}>
            DeckeFlow uses AI to generate presentation content. AI-generated content may
            contain inaccuracies. Always review outputs before professional use. Subscriptions
            auto-renew monthly and can be cancelled anytime. Payments processed securely by
            Stripe. By using DeckeFlow, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-white" style={LINK_STYLE}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-white" style={LINK_STYLE}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
