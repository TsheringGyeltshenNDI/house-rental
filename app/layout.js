import { Suspense } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { POPULAR_DZONGKHAGS, SITE_NAME } from "@/lib/constants";
import UserMenu from "@/app/components/user-menu";
import { GoogleIcon, LogoMark, PlusIcon, ShieldIcon } from "@/app/components/icons";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: `${SITE_NAME} – Houses and flats for rent in Bhutan`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Find houses and flats for rent across all 20 dzongkhags of Bhutan, or post your own for free.",
};

export const viewport = {
  themeColor: "#ea580c",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/80 backdrop-blur-lg">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
            <Logo />
            <nav className="ml-6 hidden items-center gap-1 text-sm font-medium text-stone-600 md:flex">
              <Link href="/" className="rounded-lg px-3 py-2 hover:bg-stone-100 hover:text-stone-900">
                Browse homes
              </Link>
              <Link href="/my-listings" className="rounded-lg px-3 py-2 hover:bg-stone-100 hover:text-stone-900">
                My listings
              </Link>
            </nav>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link
                href="/post"
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700"
              >
                <PlusIcon className="size-4" />
                <span>
                  Post<span className="hidden sm:inline"> a house</span>
                </span>
              </Link>
              {/* Reads the login cookie, so it streams in after the page shell. */}
              <Suspense fallback={<div className="size-9 rounded-full bg-stone-100" />}>
                <UserMenu />
              </Suspense>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <LogoMark className="size-8" />
      <span className="text-lg font-bold tracking-tight">
        House<span className="text-brand-600">Rent</span>
      </span>
    </Link>
  );
}

function Footer() {
  return (
    <footer className="mt-16 bg-stone-950 text-stone-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 text-white">
            <LogoMark className="size-8" />
            <span className="text-lg font-bold tracking-tight">
              House<span className="text-brand-400">Rent</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            Free house and flat listings for all 20 dzongkhags of Bhutan.
            Talk to owners directly. No agents, no fees.
          </p>
          <p className="mt-5 flex max-w-sm items-start gap-2 rounded-xl bg-white/5 p-3 text-xs leading-relaxed">
            <ShieldIcon className="size-4 shrink-0 text-brand-400" />
            Never pay a deposit before you have seen the house in person and met the owner.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Popular places</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {POPULAR_DZONGKHAGS.map((d) => (
              <li key={d}>
                <Link href={`/?dzongkhag=${encodeURIComponent(d)}`} className="hover:text-white">
                  {d}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">For owners</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/post" className="hover:text-white">Post a house for free</Link>
            </li>
            <li>
              <Link href="/my-listings" className="hover:text-white">Manage my listings</Link>
            </li>
            <li>
              <Link href="/login" className="inline-flex items-center gap-2 hover:text-white">
                <GoogleIcon className="size-4" />
                Log in with Google
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">
        {SITE_NAME} · Made for Bhutan ·{" "}
        <Link href="/privacy" className="hover:text-white">Privacy</Link> ·{" "}
        <Link href="/terms" className="hover:text-white">Terms</Link>
      </div>
    </footer>
  );
}
