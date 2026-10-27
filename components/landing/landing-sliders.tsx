"use client";

import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";

import Link from "next/link";
import { Autoplay, EffectCards, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const heroSlides = [
  {
    title: "بنر ۱",
    imageUrl: "https://masjid-portal-site.vercel.app/api/uploads/cmue3hdl00000il04mmb8s0lj",
  },
  {
    title: "بنر ۲",
    imageUrl: "https://masjid-portal-site.vercel.app/api/uploads/cmue3gwfb0001js04bfnfhgrb",
  },
  {
    title: "بنر ۳",
    imageUrl: "https://masjid-portal-site.vercel.app/api/uploads/cmue3gdj70000js0468dz3zdy",
  },
];

const travelSlides = [
  {
    title: "گالری ۱",
    imageUrl: "https://masjid-portal-site.vercel.app/api/uploads/cmue3lpzl0003il04pvgztm01",
  },
  {
    title: "گالری ۲",
    imageUrl: "https://masjid-portal-site.vercel.app/api/uploads/cmue3li8n0002il046xrglwup",
  },
  {
    title: "گالری ۳",
    imageUrl: "https://masjid-portal-site.vercel.app/api/uploads/cmue3la7y0001il0483zg3sl0",
  },
  {
    title: "گالری ۴",
    imageUrl: "https://masjid-portal-site.vercel.app/api/uploads/cmue3l2y80002js0496yu03jf",
  },
];

export function HeroSlider() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop
      className="rounded-3xl border border-emerald-900/20 shadow-xl"
    >
      {heroSlides.map((slide) => (
        <SwiperSlide key={slide.title}>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.imageUrl} alt={slide.title} className="h-72 w-full object-cover md:h-96" />
            <div className="absolute inset-0 bg-black/25" />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function TravelCardsSlider() {
  return (
    <div>
      <Swiper effect="cards" grabCursor modules={[EffectCards]} className="h-80 w-80 max-w-full">
        {travelSlides.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="h-full overflow-hidden rounded-3xl border border-emerald-700/20 bg-white shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-cover" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <p className="mt-4 text-center text-base font-semibold text-zinc-700">مشهد ۱۴۰۴</p>
    </div>
  );
}

type GalleryWithImages = {
  id: string;
  title: string;
  images: Array<{ id: string; imageUrl: string }>;
};

function GalleryCardsSlider({ gallery }: { gallery: GalleryWithImages }) {
  return (
    <div>
      <Swiper effect="cards" grabCursor modules={[EffectCards]} className="h-80 w-80 max-w-full">
        {gallery.images.map((image) => (
          <SwiperSlide key={image.id}>
            <div className="h-full overflow-hidden rounded-3xl border border-emerald-700/20 bg-white shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.imageUrl} alt={gallery.title} className="h-full w-full object-cover" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Link
        href={`/galleries/${gallery.id}`}
        className="mt-4 block text-center text-base font-semibold text-zinc-700 transition hover:text-emerald-700"
      >
        {gallery.title}
      </Link>
    </div>
  );
}

export function GallerySectionSliders({ galleries }: { galleries: GalleryWithImages[] }) {
  return (
    <div>
      <div className="grid gap-8 sm:grid-cols-2">
        <TravelCardsSlider />
        {galleries.map((gallery) => (
          <GalleryCardsSlider key={gallery.id} gallery={gallery} />
        ))}
      </div>
    </div>
  );
}
