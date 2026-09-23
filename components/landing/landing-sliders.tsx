"use client";

import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";

import Image from "next/image";
import { Autoplay, EffectCards, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const heroSlides = [
  {
    title: "رویدادهای فرهنگی مسجد",
    subtitle: "برنامه‌های هفتگی، کلاس‌ها و نشست‌های آموزشی",
  },
  {
    title: "همراهی با سفرهای معنوی",
    subtitle: "گزارش‌ها و تصاویر از سفرهای زیارتی و فرهنگی",
  },
  {
    title: "جامعه فعال و همدل",
    subtitle: "ثبت‌نام، عضویت در حلقه‌ها و دنبال‌کردن اخبار",
  },
];

const travelSlides = [
  {
    title: "کربلا - سال اول",
    text: "شروع مسیر با حضور نوجوانان و خانواده‌ها در برنامه‌های معنوی.",
    icon: "/globe.svg",
  },
  {
    title: "مشهد - سال اول",
    text: "اردوی فرهنگی همراه با کارگاه‌های آموزشی و نشست پرسش و پاسخ.",
    icon: "/file.svg",
  },
  {
    title: "قم - سال دوم",
    text: "تکمیل برنامه‌های تربیتی و توسعه تیم اجرایی جوانان مسجد.",
    icon: "/window.svg",
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
          <div className="flex min-h-72 flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600 px-6 text-center text-white">
            <h2 className="text-2xl font-bold md:text-4xl">{slide.title}</h2>
            <p className="mt-3 max-w-2xl text-sm text-emerald-50 md:text-lg">{slide.subtitle}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function TravelCardsSlider() {
  return (
    <div>
      <h3 className="mb-6 text-center text-2xl font-bold text-emerald-950">سفر دو ساله ما</h3>
      <Swiper effect="cards" grabCursor modules={[EffectCards]} className="h-80 w-80 max-w-full">
        {travelSlides.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-emerald-700/20 bg-white p-6 text-center shadow-lg">
              <Image src={slide.icon} alt="" width={64} height={64} className="mb-4 h-16 w-16" />
              <h4 className="text-xl font-semibold text-emerald-900">{slide.title}</h4>
              <p className="mt-2 text-sm text-zinc-700">{slide.text}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
