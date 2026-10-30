"use client";

import { useActionState } from "react";
import { reportListing } from "@/app/actions";
import { CheckIcon, FlagIcon } from "@/app/components/icons";

const REASONS = [
  "Already rented",
  "Fake or scam",
  "Wrong price or details",
  "Phone number does not work",
  "Spam or duplicate",
];

export default function ReportForm({ listingId }) {
  const [state, formAction, pending] = useActionState(reportListing, {});

  if (state.done) {
    return (
      <p className="flex items-center gap-2 text-sm text-green-700">
        <CheckIcon className="size-4" />
        Thanks. We will check this listing.
      </p>
    );
  }

  return (
    <details className="group text-sm">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-stone-500 hover:text-stone-800">
        <FlagIcon className="size-4" />
        Report this listing
      </summary>
      <form action={formAction} className="mt-3 animate-fade-in space-y-2">
        <input type="hidden" name="listingId" value={listingId} />
        <fieldset className="space-y-1.5">
          <legend className="mb-1.5 text-xs font-medium text-stone-500">What is wrong?</legend>
          {REASONS.map((reason) => (
            <label
              key={reason}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 ring-1 ring-stone-200 has-checked:bg-red-50 has-checked:ring-red-300"
            >
              <input type="radio" name="reason" value={reason} required className="accent-red-600" />
              {reason}
            </label>
          ))}
        </fieldset>
        {state.error && <p className="text-red-600">{state.error}</p>}
        <button
          disabled={pending}
          className="w-full rounded-lg bg-stone-900 px-3 py-2 font-medium text-white hover:bg-stone-700 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send report"}
        </button>
      </form>
    </details>
  );
}
