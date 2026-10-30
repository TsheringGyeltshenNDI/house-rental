import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getMyListings } from "@/lib/data";
import { formatBedrooms, formatDate, formatRent } from "@/lib/constants";
import { setListingStatus } from "@/app/actions";
import {
  BedIcon,
  CheckIcon,
  EyeIcon,
  HomeIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  RefreshIcon,
} from "@/app/components/icons";
import DeleteButton from "./delete-button";

export const metadata = { title: "My listings" };

export default function MyListingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My listings</h1>
          <p className="mt-1 text-stone-500">Edit, renew or mark your houses as rented.</p>
        </div>
        <Link
          href="/post"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700"
        >
          <PlusIcon className="size-4" />
          Post another
        </Link>
      </div>
      <Suspense fallback={<MyListingsSkeleton />}>
        <MyListings />
      </Suspense>
    </div>
  );
}

function statusOf(listing) {
  return listing.status === "rented" ? "rented" : listing.expired ? "expired" : "live";
}

async function MyListings() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my-listings");

  const listings = await getMyListings();

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-stone-200 bg-white px-6 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <HomeIcon className="size-8" />
        </span>
        <p className="mt-4 text-lg font-semibold">You have not posted anything yet</p>
        <p className="mt-1 max-w-sm text-sm text-stone-500">
          It is free and takes about two minutes. Tenants will call or WhatsApp you directly.
        </p>
        <Link
          href="/post"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700"
        >
          <PlusIcon className="size-4" />
          Post your first house
        </Link>
      </div>
    );
  }

  const counts = { live: 0, rented: 0, expired: 0 };
  for (const listing of listings) counts[statusOf(listing)]++;

  return (
    <>
      <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={listings.length} className="text-stone-900" />
        <Stat label="Live" value={counts.live} className="text-green-700" />
        <Stat label="Rented" value={counts.rented} className="text-stone-500" />
        <Stat label="Expired" value={counts.expired} className="text-amber-600" />
      </dl>

      <ul className="space-y-4">
        {listings.map((listing) => (
          <ListingRow key={listing.id} listing={listing} status={statusOf(listing)} />
        ))}
      </ul>
    </>
  );
}

function Stat({ label, value, className }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
      <dt className="text-xs font-medium text-stone-500">{label}</dt>
      <dd className={`mt-1 text-2xl font-bold tabular-nums ${className}`}>{value}</dd>
    </div>
  );
}

function ListingRow({ listing, status }) {
  const button =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition";

  return (
    <li className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-3 ring-1 ring-stone-200 sm:flex-row sm:items-center sm:p-4">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:w-44">
        {listing.images[0] && (
          <Image
            src={listing.images[0]}
            alt=""
            fill
            sizes="(min-width: 640px) 176px, 100vw"
            className={`object-cover ${status === "live" ? "" : "grayscale"}`}
          />
        )}
      </div>

      <div className="min-w-0 flex-1 px-1 sm:px-0">
        <StatusBadge status={status} expiresAt={listing.expires_at} />
        <h2 className="mt-1.5 truncate text-lg font-semibold">
          {status === "live" ? (
            <Link href={`/listing/${listing.id}`} className="hover:text-brand-700">
              {listing.title}
            </Link>
          ) : (
            listing.title
          )}
        </h2>
        <p className="font-semibold text-brand-700">
          {formatRent(listing.rent)} <span className="text-sm font-normal text-stone-500">/ month</span>
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
          <span className="inline-flex items-center gap-1">
            <BedIcon className="size-4" /> {formatBedrooms(listing.bedrooms)}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPinIcon className="size-4 shrink-0" />
            <span className="truncate">
              {listing.location}, {listing.dzongkhag}
            </span>
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 px-1 pb-1 sm:w-52 sm:flex-col sm:items-stretch sm:p-0">
        <form action={setListingStatus} className="contents">
          <input type="hidden" name="id" value={listing.id} />
          {status === "live" ? (
            <button name="status" value="rented" className={`${button} justify-center ring-stone-300 hover:bg-stone-50`}>
              <CheckIcon className="size-4" /> Mark as rented
            </button>
          ) : (
            <button
              name="status"
              value="available"
              className={`${button} justify-center bg-brand-600 text-white ring-brand-600 hover:bg-brand-700`}
            >
              <RefreshIcon className="size-4" />
              {status === "expired" ? "Renew for 30 days" : "Mark available"}
            </button>
          )}
        </form>
        <div className="flex gap-2">
          {status === "live" && (
            <Link href={`/listing/${listing.id}`} className={`${button} ring-stone-300 hover:bg-stone-50`} aria-label="View listing">
              <EyeIcon className="size-4" />
            </Link>
          )}
          <Link href={`/my-listings/${listing.id}/edit`} className={`${button} flex-1 justify-center ring-stone-300 hover:bg-stone-50`}>
            <PencilIcon className="size-4" /> Edit
          </Link>
          <DeleteButton id={listing.id} />
        </div>
      </div>
    </li>
  );
}

function StatusBadge({ status, expiresAt }) {
  const styles = {
    live: "bg-green-50 text-green-700 ring-green-200",
    rented: "bg-stone-100 text-stone-600 ring-stone-200",
    expired: "bg-amber-50 text-amber-700 ring-amber-200",
  };
  const dots = { live: "bg-green-500", rented: "bg-stone-400", expired: "bg-amber-500" };
  const labels = {
    live: `Live until ${formatDate(expiresAt)}`,
    rented: "Rented · hidden from search",
    expired: "Expired · hidden from search",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${styles[status]}`}>
      <span className={`size-1.5 rounded-full ${dots[status]}`} />
      {labels[status]}
    </span>
  );
}

function MyListingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-stone-200" />
        ))}
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-stone-200" />
      ))}
    </div>
  );
}
