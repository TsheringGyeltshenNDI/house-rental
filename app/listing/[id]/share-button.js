"use client";

import { useState } from "react";
import { CheckIcon, ShareIcon } from "@/app/components/icons";

// Opens the phone's share sheet (WhatsApp, Messenger, …). On computers
// without one, copies the link instead.
export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // The visitor closed the share sheet.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
    >
      {copied ? <CheckIcon className="size-4 text-green-600" /> : <ShareIcon className="size-4" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
