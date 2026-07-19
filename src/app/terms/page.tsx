import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — DeckeFlow",
  description: "Terms and conditions for using DeckeFlow.",
};

const LAST_UPDATED = "July 19, 2026";
const CONTACT_EMAIL = "hello@deckeflow.com";
const COMPANY_NAME = "Media Craft LLC";

export default function TermsPage() {
  return (
    <div className="lp min-h-screen px-5 py-16 md:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
          ← Back to DeckeFlow
        </Link>
        <h1 className="lp-display mt-6 text-3xl font-extrabold" style={{ color: "var(--ink)" }}>
          Terms of Service
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              1. Agreement
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              By creating an account or using DeckeFlow, you agree to these Terms of Service.
              DeckeFlow is operated by {COMPANY_NAME}. If you do not agree, do not use the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              2. The service
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              DeckeFlow is an AI-powered presentation generation tool. You provide topics and
              notes; we generate structured slide decks. Outputs are AI-generated and should
              be reviewed before use in professional or public settings. We do not guarantee
              the accuracy of AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              3. Your account
            </h2>
            <ul
              className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed"
              style={{ color: "var(--ink-muted)" }}
            >
              <li>You must be 18 or older to use DeckeFlow.</li>
              <li>You are responsible for keeping your login credentials secure.</li>
              <li>You may not share your account with others.</li>
              <li>
                One account per person. We reserve the right to close duplicate accounts.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              4. Subscriptions and billing
            </h2>
            <ul
              className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed"
              style={{ color: "var(--ink-muted)" }}
            >
              <li>Paid plans are billed monthly. Billing is handled by Stripe.</li>
              <li>Your subscription renews automatically each month until cancelled.</li>
              <li>
                You can cancel anytime from your account settings. Access continues until the
                end of the billing period — we do not provide prorated refunds for partial
                months.
              </li>
              <li>We reserve the right to change pricing with 30 days notice.</li>
              <li>
                Usage limits (presentations per month, slides per presentation) are enforced
                per plan. Unused generations do not roll over.
              </li>
            </ul>
          </section>

          <section id="refund-policy">
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              5. Refund policy
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              We do not offer refunds for monthly subscription payments except in cases of
              technical failure on our end that prevented you from using the service. To
              request a refund, contact {CONTACT_EMAIL} within 7 days of the charge with a
              description of the issue. Approved refunds are processed within 5-10 business
              days via the original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              6. Acceptable use
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              You agree not to use DeckeFlow to:
            </p>
            <ul
              className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed"
              style={{ color: "var(--ink-muted)" }}
            >
              <li>Generate content that is unlawful, defamatory, or harassing</li>
              <li>Infringe on third-party intellectual property rights</li>
              <li>Attempt to reverse-engineer, scrape, or abuse our API</li>
              <li>Create presentations containing misinformation intended to deceive</li>
              <li>Resell or redistribute DeckeFlow&apos;s service without written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              7. Your content
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              You retain ownership of the content you input and the presentations you
              generate. By using DeckeFlow, you grant us a limited license to process your
              content solely to provide the service. We do not claim ownership of your
              presentations. You are responsible for ensuring your inputs do not infringe on
              third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              8. AI-generated content disclaimer
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              DeckeFlow uses AI to generate presentation content. AI-generated content may
              contain inaccuracies, outdated information, or errors. You are solely
              responsible for reviewing and verifying any AI-generated content before using it
              professionally. {COMPANY_NAME} is not liable for decisions made based on
              AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              9. Limitation of liability
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              To the maximum extent permitted by law, {COMPANY_NAME} is not liable for
              indirect, incidental, or consequential damages arising from your use of
              DeckeFlow. Our total liability to you for any claim is limited to the amount you
              paid us in the 3 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              10. Termination
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              We reserve the right to suspend or terminate accounts that violate these terms,
              with or without notice. You may delete your account at any time from account
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              11. Governing law
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              These terms are governed by the laws of the State of Wyoming, USA. Disputes
              shall be resolved in the courts of Wyoming.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              12. Contact
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              For questions about these terms: {CONTACT_EMAIL}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
