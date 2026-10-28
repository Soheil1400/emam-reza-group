"use client";

import { X } from "lucide-react";
import { useState } from "react";

type GalleryImage = {
  id: string;
  imageUrl: string;
};

export function GalleryLightbox({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  return (
    <>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 md:mt-8 md:gap-4 lg:grid-cols-4">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveImage(image)}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.imageUrl} alt={title} className="h-56 w-full object-cover" />
          </button>
        ))}
      </section>

      {activeImage ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="بستن پیش نمایش تصویر"
            className="absolute inset-0 bg-black/70"
            onClick={() => setActiveImage(null)}
          />
          <div className="absolute top-1/2 left-1/2 w-[min(980px,95vw)] -translate-x-1/2 -translate-y-1/2">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="inline-flex items-center justify-center rounded-full bg-white p-2 text-zinc-700 shadow"
                aria-label="بستن"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeImage.imageUrl} alt={title} className="max-h-[78vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
