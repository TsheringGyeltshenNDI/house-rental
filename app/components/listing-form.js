"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { BUCKET, DZONGKHAGS, MAX_IMAGES } from "@/lib/constants";
import { CameraIcon, CheckIcon, TrashIcon, UploadIcon } from "@/app/components/icons";

const DESCRIPTION_MAX = 3000;

// Used by both "Post a house" and "Edit listing". `listing` holds the
// current values when editing.
export default function ListingForm({ action, userId, listing, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {
    values: listing ?? {},
  });
  const values = state.values ?? {};
  const [uploading, setUploading] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(values.description?.length ?? 0);

  return (
    <form action={formAction} className="space-y-5">
      {listing && <input type="hidden" name="id" value={listing.id} />}

      <Section number={1} title="Photos" subtitle="Good photos get far more calls. Add the outside, rooms, kitchen and bathroom.">
        <PhotoUploader
          userId={userId}
          initial={values.images ?? []}
          uploading={uploading}
          setUploading={setUploading}
        />
      </Section>

      <Section number={2} title="The basics">
        <Field label="Title" hint="e.g. 2 bedroom flat near Changzamtog school">
          <input name="title" required minLength={5} maxLength={120} defaultValue={values.title} className="field" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Monthly rent">
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-medium text-stone-500">
                Nu.
              </span>
              <input name="rent" type="number" required min={1} step={1} inputMode="numeric" defaultValue={values.rent} placeholder="12000" className="field pl-11" />
            </div>
          </Field>
          <Field label="Bedrooms" hint="0 for a single room or studio">
            <input name="bedrooms" type="number" required min={0} max={20} step={1} inputMode="numeric" defaultValue={values.bedrooms} placeholder="2" className="field" />
          </Field>
        </div>
      </Section>

      <Section number={3} title="Location">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Dzongkhag">
            <select name="dzongkhag" required defaultValue={values.dzongkhag ?? ""} className="field">
              <option value="" disabled>
                Choose…
              </option>
              {DZONGKHAGS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Area / location" hint="e.g. Babesa, near the petrol pump">
            <input name="location" required minLength={2} maxLength={200} defaultValue={values.location} className="field" />
          </Field>
        </div>
      </Section>

      <Section number={4} title="Contact and details">
        <Field label="Phone number" hint="Shown only when someone taps “Show phone number”. Use your WhatsApp number to get messages too.">
          <input name="phone" type="tel" required placeholder="17123456" defaultValue={values.phone} className="field" />
        </Field>
        <Field
          label="Description (optional)"
          hint="Water supply, parking, furnished, when it is free, etc."
          counter={`${descriptionLength}/${DESCRIPTION_MAX}`}
        >
          <textarea
            name="description"
            rows={5}
            maxLength={DESCRIPTION_MAX}
            defaultValue={values.description}
            onChange={(event) => setDescriptionLength(event.target.value.length)}
            className="field"
          />
        </Field>
      </Section>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-stone-200 bg-white/90 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button
          disabled={pending || uploading > 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:opacity-60"
        >
          {!pending && uploading === 0 && <CheckIcon className="size-5" />}
          {pending ? "Saving…" : uploading > 0 ? "Uploading photos…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Section({ number, title, subtitle, children }) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {number}
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, counter, children }) {
  return (
    <label className="block text-sm font-medium text-stone-800">
      <span className="mb-1.5 block">{label}</span>
      {children}
      {(hint || counter) && (
        <span className="mt-1.5 flex justify-between gap-3 text-xs font-normal text-stone-500">
          <span>{hint}</span>
          {counter && <span className="shrink-0 tabular-nums">{counter}</span>}
        </span>
      )}
    </label>
  );
}

// Photos are compressed and uploaded straight to Supabase Storage from the
// browser. The form only sends their URLs to the server.
function PhotoUploader({ userId, initial, uploading, setUploading }) {
  const [images, setImages] = useState(initial);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  // Photos added in this visit. Removing one deletes it from storage right
  // away; older photos are cleaned up by the server when the form is saved.
  const uploadedNow = useRef(new Set());
  const room = MAX_IMAGES - images.length - uploading;

  async function addFiles(fileList) {
    const files = [...fileList].filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (files.length === 0) return;

    setError(null);
    setUploading((n) => n + files.length);
    const storage = createClient().storage.from(BUCKET);

    for (const file of files) {
      try {
        const blob = await compressImage(file);
        const path = `${userId}/${crypto.randomUUID()}.jpg`;
        const { error } = await storage.upload(path, blob, { contentType: "image/jpeg" });
        if (error) throw error;

        const url = storage.getPublicUrl(path).data.publicUrl;
        uploadedNow.current.add(url);
        setImages((current) => [...current, url]);
      } catch {
        setError(`Could not upload ${file.name}. Please try another photo.`);
      }
      setUploading((n) => n - 1);
    }
  }

  function remove(url) {
    setImages((current) => current.filter((u) => u !== url));
    if (uploadedNow.current.has(url)) {
      uploadedNow.current.delete(url);
      const path = url.split(`/${BUCKET}/`)[1];
      createClient().storage.from(BUCKET).remove([path]);
    }
  }

  function makeCover(url) {
    setImages((current) => [url, ...current.filter((u) => u !== url)]);
  }

  return (
    <fieldset>
      <legend className="sr-only">Photos</legend>

      {room > 0 && (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragging
              ? "border-brand-500 bg-brand-50"
              : "border-stone-300 hover:border-brand-400 hover:bg-brand-50/50"
          }`}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <UploadIcon className="size-6" />
          </span>
          <span className="mt-3 font-semibold text-stone-800">
            <span className="text-brand-700">Choose photos</span>
            <span className="hidden sm:inline"> or drag them here</span>
          </span>
          <span className="mt-1 text-xs text-stone-500">
            Up to {MAX_IMAGES} photos · {images.length}/{MAX_IMAGES} added · large photos are shrunk automatically
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
            className="sr-only"
          />
        </label>
      )}

      {(images.length > 0 || uploading > 0) && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <div
              key={url}
              className={`group relative aspect-square overflow-hidden rounded-xl bg-stone-100 ${
                i === 0 ? "ring-2 ring-brand-500 ring-offset-2" : ""
              }`}
            >
              <input type="hidden" name="images" value={url} />
              <Image src={url} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
              {i === 0 && (
                <span className="absolute top-2 left-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur transition hover:bg-red-600"
                aria-label={`Remove photo ${i + 1}`}
              >
                <TrashIcon className="size-4" />
              </button>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(url)}
                  className="absolute inset-x-2 bottom-2 rounded-lg bg-white/90 py-1 text-xs font-semibold text-stone-800 opacity-100 shadow backdrop-blur transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                >
                  Make cover
                </button>
              )}
            </div>
          ))}

          {Array.from({ length: uploading }, (_, i) => (
            <div
              key={`uploading-${i}`}
              className="flex aspect-square animate-pulse flex-col items-center justify-center gap-1 rounded-xl bg-stone-200 text-xs text-stone-500"
            >
              <CameraIcon className="size-6" />
              Uploading…
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}
