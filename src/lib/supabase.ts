import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client. Configured via public env vars; when they're
// absent the app falls back to its local (localStorage) behavior so it still
// runs with no backend.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
