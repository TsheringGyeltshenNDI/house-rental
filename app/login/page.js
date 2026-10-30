import { Suspense } from "react";
import { SITE_NAME } from "@/lib/constants";
import { CheckIcon, LogoMark } from "@/app/components/icons";
import GoogleButton, { GoogleButtonPlaceholder } from "./google-button";

export const metadata = { title: "Log in" };

const PERKS = [
  "Post houses and flats for free",
  "Edit, renew or mark them as rented",
  "Tenants call or WhatsApp you directly",
];

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <div className="grid overflow-hidden rounded-3xl bg-white shadow-xl shadow-stone-900/5 ring-1 ring-stone-200 md:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-stone-950 bg-pattern p-10 text-white md:block">
          <div className="absolute inset-0 bg-linear-to-br from-brand-700/60 via-transparent to-red-900/50" />
          <div className="relative">
            <LogoMark className="size-10" />
            <h2 className="mt-8 text-2xl font-bold tracking-tight">
              Rent out your house to the right people.
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-stone-200">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-brand-500/30 text-brand-200">
                    <CheckIcon className="size-3.5" />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-10">
          <LogoMark className="size-10 md:hidden" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight md:mt-0">Log in to {SITE_NAME}</h1>
          <p className="mt-2 mb-8 text-sm text-stone-600">
            You only need an account to post or manage your own listings.
            Browsing is free and open to everyone.
          </p>
          <Suspense fallback={<GoogleButtonPlaceholder />}>
            <GoogleButton />
          </Suspense>
          <p className="mt-6 text-xs text-stone-500">
            We only use your Google name and photo. Your email is never shown to anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
