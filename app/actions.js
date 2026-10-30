"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getCurrentUser, isValidId } from "@/lib/data";
import { BUCKET, DZONGKHAGS, MAX_IMAGES } from "@/lib/constants";

const PUBLIC_IMAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

function refreshListing(id) {
  updateTag("listings");
  updateTag(`listing:${id}`);
}

// Turns a public image URL back into its storage path ("<user id>/<file>.jpg").
function storagePath(url) {
  return url.startsWith(PUBLIC_IMAGE_PREFIX)
    ? url.slice(PUBLIC_IMAGE_PREFIX.length)
    : null;
}

async function removeImages(supabase, urls) {
  const paths = urls.map(storagePath).filter(Boolean);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}

// Reads and checks the post/edit form. Returns { values } or { error }.
function parseListingForm(formData, userId) {
  const text = (name) => String(formData.get(name) ?? "").trim();

  const values = {
    title: text("title"),
    description: text("description"),
    dzongkhag: text("dzongkhag"),
    location: text("location"),
    rent: Number(text("rent")),
    bedrooms: Number(text("bedrooms")),
    phone: text("phone"),
    images: formData.getAll("images").map(String),
  };

  const ownFolder = `${PUBLIC_IMAGE_PREFIX}${userId}/`;
  let error = null;

  if (values.title.length < 5) error = "Title must be at least 5 characters.";
  else if (!DZONGKHAGS.includes(values.dzongkhag)) error = "Choose a dzongkhag.";
  else if (values.location.length < 2) error = "Enter the location or area.";
  else if (!Number.isInteger(values.rent) || values.rent <= 0)
    error = "Enter the monthly rent as a whole number.";
  else if (!Number.isInteger(values.bedrooms) || values.bedrooms < 0)
    error = "Enter the number of bedrooms.";
  else if (!/^\+?[\d\s-]{6,20}$/.test(values.phone))
    error = "Enter a valid phone number.";
  else if (values.images.length === 0) error = "Add at least one photo.";
  else if (values.images.length > MAX_IMAGES)
    error = `You can add up to ${MAX_IMAGES} photos.`;
  else if (values.images.some((url) => !url.startsWith(ownFolder)))
    error = "One of the photos is invalid. Please upload it again.";

  return error ? { error, values } : { values };
}

export async function createListing(prevState, formData) {
  const user = await requireUser();
  const { values, error } = parseListingForm(formData, user.id);
  if (error) return { error, values };

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("listings")
    .insert({ ...values, owner_id: user.id })
    .select("id")
    .single();

  if (dbError) return { error: dbError.message, values };

  refreshListing(data.id);
  redirect(`/listing/${data.id}`);
}

export async function updateListing(prevState, formData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const { values, error } = parseListingForm(formData, user.id);
  if (error) return { error, values };

  const supabase = await createClient();
  const { data: old } = await supabase
    .from("listings")
    .select("images")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!old) return { error: "Listing not found.", values };

  const { error: dbError } = await supabase
    .from("listings")
    .update(values)
    .eq("id", id)
    .eq("owner_id", user.id);

  if (dbError) return { error: dbError.message, values };

  await removeImages(
    supabase,
    old.images.filter((url) => !values.images.includes(url))
  );

  refreshListing(id);
  redirect("/my-listings");
}

// "Mark as rented" hides the listing. "Mark available" shows it again for
// another 30 days.
export async function setListingStatus(formData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const status = formData.get("status") === "rented" ? "rented" : "available";

  const changes = { status };
  if (status === "available") {
    changes.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  const supabase = await createClient();
  await supabase
    .from("listings")
    .update(changes)
    .eq("id", id)
    .eq("owner_id", user.id);

  refreshListing(id);
}

export async function deleteListing(formData) {
  const user = await requireUser();
  const id = String(formData.get("id"));

  const supabase = await createClient();
  const { data: deleted } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("images")
    .maybeSingle();

  if (deleted) await removeImages(supabase, deleted.images);

  refreshListing(id);
}

export async function revealPhone(id) {
  if (!isValidId(id)) return null;

  const { data } = await createPublicClient()
    .from("listings")
    .select("phone")
    .eq("id", id)
    .maybeSingle();

  return data?.phone ?? null;
}

export async function reportListing(prevState, formData) {
  const listingId = String(formData.get("listingId"));
  const reason = String(formData.get("reason") ?? "").trim();

  if (!isValidId(listingId)) return { error: "Invalid listing." };
  if (reason.length < 3) return { error: "Please tell us what is wrong." };

  const { error } = await createPublicClient()
    .from("reports")
    .insert({ listing_id: listingId, reason: reason.slice(0, 500) });

  if (error) return { error: "Could not send the report. Please try again." };
  return { done: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
