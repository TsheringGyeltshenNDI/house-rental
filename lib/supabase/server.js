import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Supabase client that acts as the logged-in user (reads the auth cookie).
// Because it reads cookies, anything using it must render inside <Suspense>.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // proxy.js refreshes the session, so this is safe to ignore.
          }
        },
      },
    }
  );
}
