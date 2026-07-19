import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — DeckeFlow",
  description: "How DeckeFlow collects, uses, and protects your data.",
};

const LAST_UPDATED = "July 19, 2026";
const CONTACT_EMAIL = "hello@deckeflow.com";
const COMPANY_NAME = "Media Craft LLC";
const COMPANY_ADDRESS = "30 N Gould St Ste R, Sheridan, Wyoming 82801, USA";

export default function PrivacyPage() {
  return (
    <div className="lp min-h-screen px-5 py-16 md:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
          ← Back to DeckeFlow
        </Link>
        <h1 className="lp-display mt-6 text-3xl font-extrabold" style={{ color: "var(--ink)" }}>
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              1. Who we are
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              DeckeFlow is operated by {COMPANY_NAME}, registered at {COMPANY_ADDRESS}. We
              provide an AI-powered presentation generation service at deckeflow.com. If you
              have questions about this policy, contact us at {CONTACT_EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              2. What data we collect
            </h2>
            <ul
              className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed"
              style={{ color: "var(--ink-muted)" }}
            >
              <li>
                <strong style={{ color: "var(--ink)" }}>Account data:</strong> Your email
                address and name when you sign up.
              </li>
              <li>
                <strong style={{ color: "var(--ink)" }}>Presentation content:</strong> Topics,
                notes, and text you enter to generate presentations. This is processed by our
                AI partner (Anthropic) and stored to enable editing and export.
              </li>
              <li>
                <strong style={{ color: "var(--ink)" }}>Usage data:</strong> Pages visited,
                features used, and presentation count — to enforce plan limits and improve the
                product.
              </li>
              <li>
                <strong style={{ color: "var(--ink)" }}>Payment data:</strong> Billing is
                handled entirely by Stripe. We do not store your card number, CVV, or bank
                details. We store your Stripe customer ID to manage your subscription.
              </li>
              <li>
                <strong style={{ color: "var(--ink)" }}>Images:</strong> Photos you upload to
                your image library are stored in our database. Stock photos are sourced from
                Pexels and are not stored by us.
              </li>
              <li id="cookies">
                <strong style={{ color: "var(--ink)" }}>Cookies:</strong> We use session
                cookies for authentication. We do not use third-party advertising cookies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              3. How we use your data
            </h2>
            <ul
              className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed"
              style={{ color: "var(--ink-muted)" }}
            >
              <li>To provide and improve the DeckeFlow service</li>
              <li>To process payments and manage your subscription</li>
              <li>To send transactional emails (receipt, password reset)</li>
              <li>To enforce usage limits per your plan</li>
              <li>We do not sell your data to third parties</li>
              <li>We do not use your presentation content to train AI models</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              4. Third-party services
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              We use the following trusted services to operate DeckeFlow:
            </p>
            <ul
              className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed"
              style={{ color: "var(--ink-muted)" }}
            >
              <li>
                <strong style={{ color: "var(--ink)" }}>Anthropic (Claude API):</strong> Powers
                AI content generation. Your prompts are sent to Anthropic&apos;s API. See
                anthropic.com/privacy.
              </li>
              <li>
                <strong style={{ color: "var(--ink)" }}>Stripe:</strong> Handles all payment
                processing. See stripe.com/privacy.
              </li>
              <li>
                <strong style={{ color: "var(--ink)" }}>Supabase:</strong> Hosts our database
                and authentication. See supabase.com/privacy.
              </li>
              <li>
                <strong style={{ color: "var(--ink)" }}>Pexels:</strong> Provides stock
                photography. See pexels.com/privacy-policy.
              </li>
              <li>
                <strong style={{ color: "var(--ink)" }}>Vercel:</strong> Hosts the DeckeFlow
                application. See vercel.com/legal/privacy-policy.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              5. Data retention
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              We retain your account data and presentations for as long as your account is
              active. If you delete your account, your presentations and personal data are
              deleted within 30 days. Anonymized usage statistics may be retained longer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              6. Your rights
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              You have the right to access, correct, export, or delete your personal data at
              any time. Email us at {CONTACT_EMAIL} with your request. We will respond within
              30 days. If you are in the EU or UK, you also have the right to lodge a
              complaint with your local data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              7. Security
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              All data is transmitted over HTTPS. Passwords are never stored — we use Supabase
              Auth which handles authentication securely. Payment data is never processed by
              our servers — it goes directly to Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              8. Changes to this policy
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              We may update this policy. If changes are significant, we will notify you by
              email. The &ldquo;last updated&rdquo; date at the top reflects the most recent
              version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              9. Contact
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              {COMPANY_NAME}
              <br />
              {COMPANY_ADDRESS}
              <br />
              Email: {CONTACT_EMAIL}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
