import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { LandingPageContent } from "@/components/landing/LandingPageContent";

export const metadata: Metadata = {
  title: "DeckeFlow — AI Presentation Builder for Professionals",
  description:
    "Turn your raw notes and ideas into executive-ready presentations in 8 minutes. Powered by AI. Export to PowerPoint or PDF. Start free.",
  openGraph: {
    title: "DeckeFlow — AI Presentation Builder for Professionals",
    description:
      "Turn your raw notes and ideas into executive-ready presentations in 8 minutes. Powered by AI. Export to PowerPoint or PDF. Start free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeckeFlow — AI Presentation Builder for Professionals",
    description:
      "Turn your raw notes and ideas into executive-ready presentations in 8 minutes. Powered by AI. Export to PowerPoint or PDF. Start free.",
  },
};

// Public marketing homepage. Server component — redirects already-signed-in
// users straight to the dashboard, otherwise renders the landing page.
export default async function HomePage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase is optional (see lib/supabase.ts) — the app runs in a local,
  // backend-less mode without it, so there's no session to check server-side.
  if (url && anonKey) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: { getAll: () => cookieStore.getAll() },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  return <LandingPageContent />;
}
