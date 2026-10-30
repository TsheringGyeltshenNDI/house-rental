import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getMyListing } from "@/lib/data";
import { updateListing } from "@/app/actions";
import ListingForm from "@/app/components/listing-form";
import FormSkeleton from "@/app/components/form-skeleton";
import { ArrowLeftIcon } from "@/app/components/icons";

export const metadata = { title: "Edit listing" };

export default function EditListingPage({ params }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/my-listings" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeftIcon className="size-4" />
        My listings
      </Link>
      <h1 className="mt-2 mb-6 text-3xl font-bold tracking-tight">Edit listing</h1>
      <Suspense fallback={<FormSkeleton />}>
        {params.then(({ id }) => (
          <EditForm id={id} />
        ))}
      </Suspense>
    </div>
  );
}

async function EditForm({ id }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/my-listings/${id}/edit`);

  const listing = await getMyListing(id);
  if (!listing) notFound();

  return (
    <ListingForm
      action={updateListing}
      userId={user.id}
      listing={listing}
      submitLabel="Save changes"
    />
  );
}
