import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";
import { createListing } from "@/app/actions";
import ListingForm from "@/app/components/listing-form";
import FormSkeleton from "@/app/components/form-skeleton";
import { CheckIcon } from "@/app/components/icons";

export const metadata = { title: "Post a house" };

export default function PostPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-brand-700">Free · takes about 2 minutes</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Post a house or flat</h1>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-stone-600">
          {["Live right away", "Stays up for 30 days", "Mark as rented any time"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <CheckIcon className="size-4 text-green-600" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <Suspense fallback={<FormSkeleton />}>
        <NewListingForm />
      </Suspense>
    </div>
  );
}

async function NewListingForm() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/post");

  return <ListingForm action={createListing} userId={user.id} submitLabel="Post listing" />;
}
