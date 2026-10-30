"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/constants";
import { GoogleIcon } from "@/app/components/icons";

const buttonClass =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3 font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50 hover:shadow disabled:opacity-60";

export default function GoogleButton() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const failed = searchParams.has("error");

  async function signIn() {
    setLoading(true);
    const next = safeRedirectPath(searchParams.get("next"));
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setLoading(false);
  }

  return (
    <>
      {failed && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          Login failed. Please try again.
        </p>
      )}
      <button onClick={signIn} disabled={loading} className={buttonClass}>
        <GoogleIcon />
        {loading ? "Opening Google…" : "Continue with Google"}
      </button>
    </>
  );
}

export function GoogleButtonPlaceholder() {
  return (
    <button disabled className={buttonClass}>
      <GoogleIcon />
      Continue with Google
    </button>
  );
}
