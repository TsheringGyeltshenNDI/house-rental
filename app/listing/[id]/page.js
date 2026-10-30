import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListing } from "@/lib/data";
import { formatBedrooms, formatDate, formatRent } from "@/lib/constants";
import {
  ArrowLeftIcon,
  BedIcon,
  CalendarIcon,
  ChevronRightIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldIcon,
  WalletIcon,
} from "@/app/components/icons";
import Gallery from "./gallery";
import PhoneReveal from "./phone-reveal";
import ReportForm from "./report-form";
import ShareButton from "./share-button";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Listing not found" };

  return {
    title: listing.title,
    description: `${formatRent(listing.rent)} per month · ${formatBedrooms(listing.bedrooms)} · ${listing.location}, ${listing.dzongkhag}`,
    openGraph: { images: listing.images.slice(0, 1) },
  };
}

export default function ListingPage({ params }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Suspense fallback={<ListingSkeleton />}>
        {params.then(({ id }) => (
          <ListingDetails id={id} />
        ))}
      </Suspense>
    </div>
  );
}

async function ListingDetails({ id }) {
  const listing = await getListing(id);
  if (!listing) notFound();

  const placeLink = `/?dzongkhag=${encodeURIComponent(listing.dzongkhag)}`;

  return (
    <article className="animate-fade-up">
      <div className="mb-4 flex items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm text-stone-500">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-stone-900">
            <ArrowLeftIcon className="size-4" />
            All homes
          </Link>
          <ChevronRightIcon className="size-4 shrink-0" />
          <Link href={placeLink} className="truncate hover:text-stone-900">
            {listing.dzongkhag}
          </Link>
        </nav>
        <ShareButton title={listing.title} />
      </div>

      <Gallery images={listing.images} title={listing.title} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{listing.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-stone-600">
            <MapPinIcon className="size-5 shrink-0 text-brand-600" />
            {listing.location}, {listing.dzongkhag}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Fact icon={WalletIcon} label="Monthly rent" value={formatRent(listing.rent)} />
            <Fact icon={BedIcon} label="Size" value={formatBedrooms(listing.bedrooms)} />
            <Fact icon={CalendarIcon} label="Posted on" value={formatDate(listing.created_at)} />
          </dl>

          <div className="mt-8 border-t border-stone-200 pt-8">
            <h2 className="text-lg font-semibold">About this place</h2>
            {listing.description ? (
              <p className="mt-3 leading-relaxed whitespace-pre-line text-stone-700">{listing.description}</p>
            ) : (
              <p className="mt-3 text-stone-500">
                The owner did not add a description. Call or message them to ask about water supply,
                parking and when it is free.
              </p>
            )}
          </div>

          <div className="mt-8 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <h2 className="flex items-center gap-2 font-semibold text-amber-900">
              <ShieldIcon className="size-5" />
              Stay safe when renting
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-amber-900/80">
              <li>Visit the house in person before paying anything.</li>
              <li>Meet the owner and check that they really own or manage it.</li>
              <li>Agree on rent, deposit and bills in writing.</li>
            </ul>
          </div>
        </div>

        <aside id="contact" className="scroll-mt-24 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-900/5 ring-1 ring-stone-200">
            <p className="text-3xl font-bold tracking-tight">
              {formatRent(listing.rent)}
              <span className="text-base font-medium text-stone-500"> / month</span>
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {formatBedrooms(listing.bedrooms)} · {listing.dzongkhag}
            </p>
            <div className="mt-5">
              <PhoneReveal
                listing={{
                  id: listing.id,
                  title: listing.title,
                  rent: listing.rent,
                  location: listing.location,
                  dzongkhag: listing.dzongkhag,
                }}
              />
            </div>
            <div className="mt-5 border-t border-stone-100 pt-4">
              <ReportForm listingId={listing.id} />
            </div>
          </div>
        </aside>
      </div>

      {/* On phones the contact box is far down the page, so keep a shortcut in view. */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <p className="text-lg font-bold">
          {formatRent(listing.rent)}
          <span className="text-sm font-medium text-stone-500"> / month</span>
        </p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700"
        >
          <PhoneIcon className="size-4" />
          Contact owner
        </a>
      </div>
    </article>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
      <Icon className="size-5 text-brand-600" />
      <dt className="mt-2 text-xs text-stone-500">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div>
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-stone-200" />
      <div className="aspect-[4/3] animate-pulse rounded-3xl bg-stone-200 sm:aspect-auto sm:h-[28rem]" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="h-8 w-3/4 animate-pulse rounded bg-stone-200" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-stone-200" />
        </div>
        <div className="h-64 animate-pulse rounded-3xl bg-stone-200" />
      </div>
    </div>
  );
}
