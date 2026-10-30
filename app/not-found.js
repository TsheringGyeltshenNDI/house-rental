import Link from "next/link";
import { ArrowLeftIcon, HomeIcon } from "@/app/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <HomeIcon className="size-8" />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">Not found</h1>
      <p className="mt-2 text-stone-600">
        This listing may have been rented out, expired or removed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
      >
        <ArrowLeftIcon className="size-4" />
        Browse all homes
      </Link>
    </div>
  );
}
