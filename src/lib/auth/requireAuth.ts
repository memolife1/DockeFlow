import { NextResponse } from "next/server";
import { getAuthedUser, isBillingConfigured } from "@/lib/subscription";

export interface AuthedUser {
  id: string;
  email: string;
}

type AuthResult =
  | { user: AuthedUser; token: string | null; error: null }
  | { user: null; token: null; error: NextResponse };

// Verifies the caller's Supabase session from a Bearer token (the app never
// uses cookie-based sessions — the browser client keeps its session in
// localStorage and attaches it manually, see lib/checkout.ts). In local/demo
// mode (no Supabase configured) every route that calls this stays open,
// matching how the rest of the app behaves without a backend — there are no
// real accounts to protect yet.
//
// Pass `strict: true` for routes that must never fall back to the demo-mode
// bypass regardless of billing config — e.g. Stripe checkout, which creates
// a real charge and must always be tied to a real verified user.
export async function requireAuth(
  req: Request,
  opts: { strict?: boolean } = {},
): Promise<AuthResult> {
  if (!isBillingConfigured && !opts.strict) {
    return { user: { id: "demo", email: "" }, token: null, error: null };
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") ?? null;
  const user = token ? await getAuthedUser(token) : null;

  if (!user || !token) {
    return {
      user: null,
      token: null,
      error: NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 },
      ),
    };
  }

  return { user: { id: user.id, email: user.email ?? "" }, token, error: null };
}
