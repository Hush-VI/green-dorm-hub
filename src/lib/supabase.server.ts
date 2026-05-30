import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Server-only Supabase client using the service role key (bypasses RLS).
// Never import this file from client code — the .server.ts suffix ensures
// Vite tree-shakes it from the browser bundle.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
