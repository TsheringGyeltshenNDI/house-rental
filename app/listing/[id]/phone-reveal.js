"use client";

import { useState, useTransition } from "react";
import { revealPhone } from "@/app/actions";
import { whatsappLink, whatsappMessage } from "@/lib/constants";
import { CheckIcon, CopyIcon, EyeIcon, PhoneIcon, WhatsAppIcon } from "@/app/components/icons";

// The phone number is not in the page HTML, which keeps it away from
// scrapers. It is fetched only when a visitor taps the button.
export default function PhoneReveal({ listing }) {
  const [contact, setContact] = useState(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function show() {
    startTransition(async () => {
      const phone = await revealPhone(listing.id);
      if (!phone) return setFailed(true);
      // The owner gets a ready-made message that says which house it is about.
      const message = whatsappMessage({ ...listing, url: location.href.split("?")[0] });
      setContact({ phone, whatsapp: whatsappLink(phone, message) });
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(contact.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; the number is visible anyway.
    }
  }

  if (failed) {
    return (
      <p className="rounded-xl bg-stone-100 p-3 text-sm text-stone-600">
        This listing is no longer available.
      </p>
    );
  }

  if (!contact) {
    return (
      <button
        onClick={show}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:opacity-60"
      >
        <EyeIcon className="size-5" />
        {pending ? "Loading…" : "Show phone number"}
      </button>
    );
  }

  return (
    <div className="animate-fade-in space-y-2.5">
      <div className="flex items-center justify-between rounded-xl bg-stone-100 px-4 py-3">
        <div>
          <p className="text-xs text-stone-500">Owner&apos;s phone</p>
          <p className="font-mono text-lg font-semibold tracking-wide">{contact.phone}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="rounded-lg p-2 text-stone-500 hover:bg-white hover:text-stone-900"
          aria-label="Copy phone number"
        >
          {copied ? <CheckIcon className="size-5 text-green-600" /> : <CopyIcon className="size-5" />}
        </button>
      </div>
      <a
        href={contact.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3 font-semibold text-white shadow-lg shadow-whatsapp/25 transition hover:bg-whatsapp-dark"
      >
        <WhatsAppIcon className="size-5" />
        Message on WhatsApp
      </a>
      <a
        href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
        className="flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-3 font-semibold text-stone-800 transition hover:bg-stone-50"
      >
        <PhoneIcon className="size-5" />
        Call owner
      </a>
      <p className="text-center text-xs text-stone-500">
        WhatsApp opens with a message about this house, ready to send.
      </p>
    </div>
  );
}
