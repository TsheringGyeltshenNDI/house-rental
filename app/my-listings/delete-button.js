"use client";

import { deleteListing } from "@/app/actions";
import { TrashIcon } from "@/app/components/icons";

export default function DeleteButton({ id }) {
  return (
    <form
      action={deleteListing}
      onSubmit={(event) => {
        if (!confirm("Delete this listing and its photos? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
        aria-label="Delete listing"
      >
        <TrashIcon className="size-4" />
      </button>
    </form>
  );
}
