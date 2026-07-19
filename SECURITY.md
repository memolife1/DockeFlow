# DeckeFlow Security Audit — July 2026

## Status: PASSED (one manual follow-up noted below)

## API authentication
- [x] Added a shared `requireAuth()` helper (`src/lib/auth/requireAuth.ts`) and applied it to every
      route that reads or writes user data: `/api/generate`, `/api/subscription`,
      `/api/stripe/checkout`, `/api/brand/extract`, `/api/brand/extract-url`, `/api/share` (POST).
      It respects the app's existing local/demo mode (no Supabase configured → unrestricted, matching
      every other part of this codebase) except for `/api/stripe/checkout`, which always requires a
      real verified user (`strict: true`) since it creates a real charge.
- [x] `/api/stripe/webhook` and `/api/share` (GET, by token) remain intentionally public, as designed.
- [x] Updated the three client call sites that previously sent no `Authorization` header
      (`UploadStyleReference.tsx` ×2, `ExportDialog.tsx`) to attach the user's Supabase session token.

## Stripe security
- [x] Webhook signature is verified (`stripe.webhooks.constructEvent`) before any database write —
      already correct, no change needed.
- [x] Checkout validates `priceId` against `PLANS`'s known Stripe price IDs — already correct.
- [x] Checkout identifies the user from their own session token, never from the request body —
      already correct. Added rate limiting on top.
- [x] Stripe customer ID is read from *our* database (via a token-scoped Supabase client), never
      accepted from the client — already correct.

## Supabase Row Level Security (live-audited against the actual project, not assumed)
- [x] RLS is enabled on all 5 public tables (`presentations`, `subscriptions`, `brand_themes`,
      `shared_decks`, `user_subscriptions`).
- [x] **Fixed:** `shared_decks` had a `"public insert"` policy with `WITH CHECK (true)` — any
      unauthenticated caller could insert an arbitrary row directly via the Supabase REST API.
      Replaced with `authenticated_insert`, requiring `auth.uid() IS NOT NULL`. Public read-by-token
      is preserved (intended behavior for share links).
- [x] **Fixed:** 5 `SECURITY DEFINER` RPC functions (`ensure_subscription_row`,
      `increment_presentation_usage`, `reset_monthly_usage_if_needed`, `set_stripe_customer_id`,
      `handle_new_user_subscription`) had implicit `EXECUTE` granted to `PUBLIC`, making them
      callable by the unauthenticated `anon` role. Each function already internally guards with
      `auth.uid() = p_user_id` (verified by reading every function body), so this was not actually
      exploitable — but the grant was revoked from `PUBLIC` and re-granted only to `authenticated`
      as defense in depth.
- [x] `user_subscriptions` / `brand_themes` / `presentations` already had correct owner-only
      policies; no gaps found.
- [ ] **Manual follow-up (not fixable via code or SQL):** Supabase's leaked-password-protection
      (HaveIBeenPwned check) is disabled at the project level. Enable it in the Supabase Dashboard
      under Authentication → Policies.

## Input validation & injection prevention
- [x] `/api/generate` now validates title (required, ≤200 chars), notes (≤5000 chars), slide count
      (4–30), and language (fixed allowlist) before doing any work.
- [x] Image/logo upload size and extension limits already existed client-side
      (`src/app/images/page.tsx`: 10MB, jpg/png/webp; `src/app/logos/page.tsx`: 2MB, png/svg/jpg) —
      verified, no change needed.
- [x] SSRF guard (`src/lib/netGuard.ts`) already runs `assertPublicHttpUrl()` before every fetch in
      `/api/brand/extract-url` (initial page fetch, linked stylesheets, and favicon) — verified
      correct placement, and it already rejects non-http(s) schemes, private/loopback/link-local
      ranges, and unresolvable hosts, with an 8s timeout on every fetch. No change needed.

## Rate limiting
- [x] Added `src/lib/rateLimit.ts` (in-memory, per-key sliding window).
- [x] `/api/generate`: 10 requests / 60s per user.
- [x] `/api/stripe/checkout`: 5 requests / 300s per user.
- [x] `/api/brand/extract-url`: 20 requests / 60s per user.
- Verified in isolation: the 11th call within a window is correctly rejected with `429`.

## Security headers (`next.config.mjs`)
- [x] `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`,
      `Referrer-Policy`, `Permissions-Policy`, and a `Content-Security-Policy` scoped to the domains
      this app actually loads (Google Fonts, Pexels images, Vimeo player/thumbnail, Supabase).
- [x] `/api/*` responses additionally send `Cache-Control: no-store` / `Pragma: no-cache`.
- Verified live against a running server that all headers are present on both page and API responses.

## Sensitive data exposure
- [x] Grepped the full client-side codebase (`"use client"` files, `src/components/`) for
      `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` — zero matches.
- [x] Fixed one internal-error leak: `/api/share` was returning the raw Supabase `error.message` to
      the client; now logs it server-side and returns a generic message. Every other catch block in
      `src/app/api/**` was audited and already either logs server-side only or returns a
      pre-written, safe message.
- [x] Built the app and grepped `.next/static/` for real secret values (`sb_secret_` prefix, the
      actual configured `STRIPE_SECRET_KEY`/`SUPABASE_SERVICE_ROLE_KEY` values) — no matches. One
      substring hit on the literal word "service_role" turned out to be the Supabase SDK's own
      key-format-validation code, not a leaked value.

## Payment data
- [x] Grepped for `cardNumber`, `card_number`, `cvv`, `cvc`, `expiry` — zero matches. All payment
      input is handled by Stripe's hosted checkout page; DeckeFlow never touches card data.
- [x] Usage-limit enforcement (`checkCanGenerate`) already runs server-side in `/api/generate`,
      not just in the client UI — verified.

## Final scan
- [x] `npm audit` — 0 vulnerabilities at any severity.
- [x] Grepped for hardcoded `sk_live`/`sk_test`/`pk_live`/`sb_secret`/`whsec_`/JWT-shaped strings in
      source — zero matches.
- [x] `npm run build` — zero TypeScript errors, both before and after every phase of this audit.

## Contact for security issues
hello@deckeflow.com
