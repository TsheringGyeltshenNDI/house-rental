"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, ImagesIcon, XIcon } from "@/app/components/icons";

// Photo mosaic on larger screens, a swipeable strip on phones, and a
// full-screen viewer (arrow keys / Esc) when a photo is tapped.
export default function Gallery({ images, title }) {
  const [open, setOpen] = useState(null); // index of the photo being viewed
  const close = useCallback(() => setOpen(null), []);
  const alt = (i) => `${title} – photo ${i + 1} of ${images.length}`;

  return (
    <>
      <MobileStrip images={images} alt={alt} onOpen={setOpen} />
      <Mosaic images={images} alt={alt} onOpen={setOpen} />
      {open !== null && (
        <Lightbox images={images} alt={alt} index={open} setIndex={setOpen} onClose={close} />
      )}
    </>
  );
}

function MobileStrip({ images, alt, onOpen }) {
  const [current, setCurrent] = useState(0);

  function onScroll(event) {
    const el = event.currentTarget;
    setCurrent(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative -mx-4 sm:hidden">
      <div onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => onOpen(i)}
            className="relative aspect-[4/3] w-full shrink-0 snap-center bg-stone-200"
          >
            <Image src={src} alt={alt(i)} fill preload={i === 0} sizes="100vw" className="object-cover" />
          </button>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {current + 1} / {images.length}
          </span>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((src, i) => (
              <span
                key={src}
                className={`h-1.5 rounded-full bg-white transition-all ${i === current ? "w-4" : "w-1.5 opacity-60"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Mosaic({ images, alt, onOpen }) {
  const shown = images.slice(0, 5);
  const layout =
    shown.length === 1
      ? "grid-cols-1"
      : shown.length === 2
        ? "grid-cols-2"
        : "grid-cols-4 grid-rows-2";

  return (
    <div className={`relative hidden h-[28rem] gap-2 overflow-hidden rounded-3xl sm:grid ${layout}`}>
      {shown.map((src, i) => {
        // The first photo is big. With 3 photos the other two stack on the
        // right; with 4 the last one fills the bottom-right corner.
        const span =
          shown.length >= 3 && i === 0
            ? "col-span-2 row-span-2"
            : shown.length === 3 || (shown.length === 4 && i === 3)
              ? "col-span-2"
              : "";
        return (
          <button
            key={src}
            type="button"
            onClick={() => onOpen(i)}
            className={`group relative overflow-hidden bg-stone-200 ${span}`}
          >
            <Image
              src={src}
              alt={alt(i)}
              fill
              preload={i === 0}
              sizes={i === 0 ? "(min-width: 1152px) 600px, 50vw" : "(min-width: 1152px) 300px, 25vw"}
              className="object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-90"
            />
          </button>
        );
      })}
      {images.length > 1 && (
        <button
          type="button"
          onClick={() => onOpen(0)}
          className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold shadow-lg ring-1 ring-black/5 backdrop-blur hover:bg-white"
        >
          <ImagesIcon className="size-4" />
          Show all {images.length} photos
        </button>
      )}
    </div>
  );
}

function Lightbox({ images, alt, index, setIndex, onClose }) {
  const closeRef = useRef(null);
  const count = images.length;
  const go = (step) => setIndex((i) => (i + step + count) % count);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (event.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [count, onClose, setIndex]);

  const navButton =
    "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/25";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-black/95"
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80">
        <span>
          {index + 1} / {count}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white hover:bg-white/15"
          aria-label="Close"
        >
          <XIcon className="size-6" />
        </button>
      </div>

      <div className="relative flex-1">
        <Image key={images[index]} src={images[index]} alt={alt(index)} fill sizes="100vw" className="animate-fade-in object-contain" />
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className={`${navButton} left-3`} aria-label="Previous photo">
              <ChevronLeftIcon className="size-6" />
            </button>
            <button type="button" onClick={() => go(1)} className={`${navButton} right-3`} aria-label="Next photo">
              <ChevronRightIcon className="size-6" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto p-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative size-14 shrink-0 overflow-hidden rounded-lg transition ${
                i === index ? "ring-2 ring-white" : "opacity-50 hover:opacity-100"
              }`}
              aria-label={`Show photo ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
