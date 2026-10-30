import { Suspense } from "react";
import Form from "next/form";
import Link from "next/link";
import { getListings } from "@/lib/data";
import { DZONGKHAGS, POPULAR_DZONGKHAGS, SORTS, formatRent } from "@/lib/constants";
import ListingCard from "@/app/components/listing-card";
import {
  ArrowRightIcon,
  HomeIcon,
  PhoneIcon,
  SearchIcon,
  ShieldIcon,
  SparkleIcon,
  XIcon,
} from "@/app/components/icons";

// Turns the URL query into safe filter values.
function parseFilters(searchParams) {
  const one = (value) => (Array.isArray(value) ? value[0] : value) ?? "";
  const positiveInt = (value) => {
    const n = Number(one(value));
    return Number.isInteger(n) && n > 0 ? n : undefined;
  };

  const dzongkhag = one(searchParams.dzongkhag);
  const sort = one(searchParams.sort);
  return {
    dzongkhag: DZONGKHAGS.includes(dzongkhag) ? dzongkhag : undefined,
    maxRent: positiveInt(searchParams.maxRent),
    bedrooms: positiveInt(searchParams.bedrooms),
    q: one(searchParams.q).trim().slice(0, 60) || undefined,
    sort: SORTS.some((s) => s.value === sort) && sort ? sort : undefined,
  };
}

// Builds a home page link with some filters changed (undefined removes one).
function hrefWith(filters, changes) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, ...changes })) {
    if (value !== undefined && value !== "") params.set(key, value);
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default function HomePage({ searchParams }) {
  return (
    <>
      <section className="relative overflow-hidden bg-stone-950 bg-pattern">
        <div className="absolute inset-0 bg-linear-to-br from-brand-700/50 via-transparent to-red-900/40" />
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-10 sm:pt-20 sm:pb-14">
          <p className="inline-flex animate-fade-up items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-white/15">
            <SparkleIcon className="size-3.5" />
            Free · No agents · All 20 dzongkhags
          </p>
          <h1 className="mt-4 max-w-2xl animate-fade-up text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
            Find your next home in <span className="text-brand-400">Bhutan</span>
          </h1>
          <p className="mt-3 max-w-xl animate-fade-up text-base text-stone-300 sm:text-lg">
            Browse houses and flats for rent and talk to the owner directly by phone or WhatsApp.
          </p>

          <div className="mt-8 animate-fade-up">
            {/* The fallback is the same form, empty, so the page never jumps. */}
            <Suspense fallback={<Filters />}>
              {searchParams.then((sp) => (
                <Filters filters={parseFilters(sp)} />
              ))}
            </Suspense>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-300">
            <li className="flex items-center gap-2">
              <PhoneIcon className="size-4 text-brand-400" /> Contact owners directly
            </li>
            <li className="flex items-center gap-2">
              <HomeIcon className="size-4 text-brand-400" /> Free to post, free to browse
            </li>
            <li className="flex items-center gap-2">
              <ShieldIcon className="size-4 text-brand-400" /> Report fake listings in one tap
            </li>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<ResultsSkeleton />}>
          {searchParams.then((sp) => (
            <Results filters={parseFilters(sp)} />
          ))}
        </Suspense>

        <OwnerCallout />
      </div>
    </>
  );
}

function Filters({ filters = {} }) {
  const cell =
    "block rounded-xl px-4 py-2.5 transition hover:bg-stone-100 focus-within:bg-stone-100";
  const label = "block text-xs font-semibold text-stone-900";
  const control = "mt-0.5 w-full bg-transparent text-sm text-stone-600 outline-none";

  return (
    <Form
      action="/"
      // Remount when the URL changes so "Clear" also resets the inputs.
      key={JSON.stringify(filters)}
      className="grid gap-1 rounded-2xl bg-white p-2 shadow-2xl shadow-black/30 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.3fr_1fr_1fr_auto] lg:items-center"
    >
      {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}
      <label className={cell}>
        <span className={label}>Dzongkhag</span>
        <select name="dzongkhag" defaultValue={filters.dzongkhag ?? ""} className={control}>
          <option value="">All dzongkhags</option>
          {DZONGKHAGS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </label>
      <label className={cell}>
        <span className={label}>Area</span>
        <input name="q" defaultValue={filters.q} placeholder="e.g. Babesa, Olakha" className={control} />
      </label>
      <label className={cell}>
        <span className={label}>Max rent (Nu.)</span>
        <input
          name="maxRent"
          type="number"
          min="1"
          step="500"
          inputMode="numeric"
          defaultValue={filters.maxRent}
          placeholder="Any price"
          className={control}
        />
      </label>
      <label className={cell}>
        <span className={label}>Bedrooms</span>
        <select name="bedrooms" defaultValue={filters.bedrooms ?? ""} className={control}>
          <option value="">Any</option>
          <option value="1">1+ bedrooms</option>
          <option value="2">2+ bedrooms</option>
          <option value="3">3+ bedrooms</option>
          <option value="4">4+ bedrooms</option>
        </select>
      </label>
      <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 sm:col-span-2 lg:col-span-1">
        <SearchIcon className="size-5" />
        Search
      </button>
    </Form>
  );
}

async function Results({ filters }) {
  const listings = await getListings(filters);
  const heading = filters.dzongkhag
    ? `Homes for rent in ${filters.dzongkhag}`
    : "Latest homes for rent";

  return (
    <section>
      <PlaceChips filters={filters} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {listings.length === 0
              ? "No homes found"
              : `${listings.length}${listings.length === 60 ? "+" : ""} ${listings.length === 1 ? "home" : "homes"} available`}
          </p>
        </div>
        <SortTabs filters={filters} />
      </div>

      <ActiveFilters filters={filters} />

      {listings.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border-2 border-dashed border-stone-200 bg-white px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <SearchIcon className="size-6" />
          </span>
          <p className="mt-4 text-lg font-semibold">No houses match your search</p>
          <p className="mt-1 max-w-sm text-sm text-stone-500">
            Try another dzongkhag, a higher rent or fewer bedrooms. New homes are posted every day.
          </p>
          <Link href="/" className="mt-5 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-700">
            Clear all filters
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} preload={i < 3} />
          ))}
        </div>
      )}
    </section>
  );
}

function PlaceChips({ filters }) {
  const chip = "shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition";
  const on = "bg-stone-900 text-white ring-stone-900";
  const off = "bg-white text-stone-700 ring-stone-200 hover:ring-stone-400";

  return (
    <nav aria-label="Popular places" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <Link href={hrefWith(filters, { dzongkhag: undefined })} className={`${chip} ${filters.dzongkhag ? off : on}`}>
        All of Bhutan
      </Link>
      {POPULAR_DZONGKHAGS.map((d) => (
        <Link
          key={d}
          href={hrefWith(filters, { dzongkhag: d })}
          className={`${chip} ${filters.dzongkhag === d ? on : off}`}
        >
          {d}
        </Link>
      ))}
    </nav>
  );
}

function SortTabs({ filters }) {
  const current = filters.sort ?? "";
  return (
    <div className="flex rounded-xl bg-stone-200/70 p-1 text-sm" role="group" aria-label="Sort by">
      {SORTS.map((s) => (
        <Link
          key={s.value}
          href={hrefWith(filters, { sort: s.value || undefined })}
          aria-current={current === s.value ? "true" : undefined}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            current === s.value ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          {s.label}
        </Link>
      ))}
    </div>
  );
}

function ActiveFilters({ filters }) {
  const active = [
    filters.dzongkhag && { key: "dzongkhag", label: filters.dzongkhag },
    filters.q && { key: "q", label: `Area: ${filters.q}` },
    filters.maxRent && { key: "maxRent", label: `Up to ${formatRent(filters.maxRent)}` },
    filters.bedrooms && { key: "bedrooms", label: `${filters.bedrooms}+ bedrooms` },
  ].filter(Boolean);

  if (active.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {active.map((f) => (
        <Link
          key={f.key}
          href={hrefWith(filters, { [f.key]: undefined })}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pr-2 pl-3 text-sm font-medium text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
          aria-label={`Remove filter ${f.label}`}
        >
          {f.label}
          <XIcon className="size-3.5" />
        </Link>
      ))}
      <Link href={hrefWith({}, { sort: filters.sort })} className="text-sm font-medium text-stone-500 underline-offset-2 hover:underline">
        Clear all
      </Link>
    </div>
  );
}

function OwnerCallout() {
  return (
    <section className="relative mt-16 overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 to-red-700 px-6 py-10 text-white sm:px-10">
      <div className="absolute inset-0 bg-pattern" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Have a house or flat to rent?</h2>
          <p className="mt-2 max-w-lg text-brand-50">
            Post it for free in two minutes. Add photos, set your rent and get calls and WhatsApp messages from tenants directly.
          </p>
        </div>
        <Link
          href="/post"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-stone-900 shadow-lg transition hover:bg-brand-50"
        >
          Post for free
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div>
      <div className="flex gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-stone-200" />
        ))}
      </div>
      <div className="mt-6 h-8 w-64 animate-pulse rounded-lg bg-stone-200" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
            <div className="aspect-[4/3] animate-pulse bg-stone-200" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
