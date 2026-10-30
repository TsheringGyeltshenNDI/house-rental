import Image from "next/image";
import Link from "next/link";
import { formatBedrooms, formatDate, formatRent } from "@/lib/constants";
import { BedIcon, CalendarIcon, HomeIcon, ImagesIcon, MapPinIcon } from "@/app/components/icons";

export default function ListingCard({ listing, preload = false }) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/10 hover:ring-stone-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {listing.images[0] ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            preload={preload}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300">
            <HomeIcon className="size-12" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent" />

        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-stone-800 shadow-sm backdrop-blur">
          {listing.dzongkhag}
        </span>
        {listing.images.length > 1 && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            <ImagesIcon className="size-3.5" />
            {listing.images.length}
          </span>
        )}
        <p className="absolute bottom-3 left-3 text-xl font-bold text-white drop-shadow">
          {formatRent(listing.rent)}
          <span className="text-sm font-medium text-white/85"> / month</span>
        </p>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-1 font-semibold text-stone-900 group-hover:text-brand-700">
          {listing.title}
        </h2>
        <p className="mt-1 mb-4 flex items-center gap-1 text-sm text-stone-600">
          <MapPinIcon className="size-4 shrink-0 text-stone-400" />
          <span className="truncate">{listing.location}</span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-700">
            <BedIcon className="size-3.5" />
            {formatBedrooms(listing.bedrooms)}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarIcon className="size-3.5" />
            {formatDate(listing.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
