import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

// The phone number is left out on purpose. It is only sent when a visitor
// taps "Show phone number" (see revealPhone in app/actions.js).
const PUBLIC_COLUMNS =
  "id, title, description, dzongkhag, location, rent, bedrooms, images, created_at";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidId(id) {
  return UUID_RE.test(id);
}

// Public listings. Row Level Security only returns available, unexpired ones.
// Cached for everyone and refreshed whenever a listing changes.
export async function getListings({ dzongkhag, maxRent, bedrooms, q, sort } = {}) {
  "use cache";
  cacheTag("listings");
  cacheLife("minutes");

  let query = createPublicClient().from("listings").select(PUBLIC_COLUMNS);

  if (sort === "rent-asc") query = query.order("rent", { ascending: true });
  if (sort === "rent-desc") query = query.order("rent", { ascending: false });
  query = query.order("created_at", { ascending: false }).limit(60);

  if (dzongkhag) query = query.eq("dzongkhag", dzongkhag);
  if (maxRent) query = query.lte("rent", maxRent);
  if (bedrooms) query = query.gte("bedrooms", bedrooms);
  if (q) query = query.ilike("location", `%${q.replace(/[%_\\]/g, "")}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getListing(id) {
  "use cache";
  cacheTag("listings", `listing:${id}`);
  cacheLife("minutes");

  if (!isValidId(id)) return null;

  const { data, error } = await createPublicClient()
    .from("listings")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

// The logged-in user, or null. Reads cookies, so call it inside <Suspense>.
export const getCurrentUser = cache(async () => {
  // Supabase checks the token's expiry against the clock, so wait for the
  // request first (otherwise Next.js tries to prerender it and errors).
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return {
    id: user.id,
    name: user.user_metadata?.full_name ?? user.email,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };
});

export async function getMyListings() {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Expired listings are hidden from search, so tell the owner.
  const now = Date.now();
  return data.map((listing) => ({
    ...listing,
    expired: new Date(listing.expires_at).getTime() <= now,
  }));
}

export async function getMyListing(id) {
  const user = await getCurrentUser();
  if (!user || !isValidId(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
