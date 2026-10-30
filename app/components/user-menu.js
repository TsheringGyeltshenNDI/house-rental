import Link from "next/link";
import { getCurrentUser } from "@/lib/data";
import { signOut } from "@/app/actions";
import { ChevronDownIcon, GoogleIcon, ListIcon, LogOutIcon, PlusIcon } from "@/app/components/icons";

export default async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-50 hover:text-stone-900 hover:ring-stone-300"
      >
        <GoogleIcon className="size-4" />
        Log in
      </Link>
    );
  }

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 hover:text-stone-900";

  return (
    <details className="group relative">
      <summary
        className="flex cursor-pointer list-none items-center gap-1 rounded-full p-0.5 ring-1 ring-stone-200 transition hover:ring-stone-300"
        aria-label="Account menu"
      >
        <Avatar user={user} />
        <ChevronDownIcon className="mr-1 size-4 text-stone-500 transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 mt-2 w-64 animate-fade-in rounded-2xl border border-stone-200 bg-white p-2 shadow-xl shadow-stone-900/10">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-stone-500">Signed in with Google</p>
          </div>
        </div>
        <div className="my-1 h-px bg-stone-100" />
        <Link href="/my-listings" className={itemClass}>
          <ListIcon className="size-4" /> My listings
        </Link>
        <Link href="/post" className={itemClass}>
          <PlusIcon className="size-4" /> Post a house
        </Link>
        <div className="my-1 h-px bg-stone-100" />
        <form action={signOut}>
          <button className={itemClass}>
            <LogOutIcon className="size-4" /> Log out
          </button>
        </form>
      </div>
    </details>
  );
}

function Avatar({ user }) {
  return user.avatarUrl ? (
    // Google avatar; tiny, so a plain <img> is fine.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.avatarUrl}
      alt=""
      referrerPolicy="no-referrer"
      className="size-8 shrink-0 rounded-full"
    />
  ) : (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold uppercase text-brand-800">
      {user.name.charAt(0)}
    </span>
  );
}
