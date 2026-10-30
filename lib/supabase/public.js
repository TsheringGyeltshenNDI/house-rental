import "server-only";
import { createClient } from "@supabase/supabase-js";

// Supabase client with no user session. Used for public listing reads so the
// results can be cached and shared between all visitors.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
