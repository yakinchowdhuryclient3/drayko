import { createClient } from "@supabase/supabase-js";

// ⚠️ ADMIN ONLY - Never use in client/browser
// Uses SERVICE_ROLE_KEY — bypasses RLS
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}