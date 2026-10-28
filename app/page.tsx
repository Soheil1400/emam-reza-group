import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { CalendarDays, UserRound } from "lucide-react";

import { GallerySectionSliders, HeroSlider } from "@/components/landing/landing-sliders";
import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "صفحه اصلی",
  description: "معرفی گروه فرهنگی امام رضا(ع)، گالری تصاویر و جدیدترین روایت‌ها.",
  canonicalPath: "/",
});

function formatFaDate(dateValue: Date | string | null | undefined) {
  if (!dateValue) return "تاریخ نامشخص";
  const parsedDate = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return "تاریخ نامشخص";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(parsedDate);
}

const getCachedHomeData = unstable_cache(
  async () => {
    const [blogs, galleries, heroSlides] = await Promise.all([
      db.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: {
          author: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      db.gallery.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            select: { id: true, imageUrl: true },
          },
        },
      }),
      db.homeBanner.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          title: true,
          imageUrl: true,
        },
      }),
    ]);

    return { blogs, galleries, heroSlides };
  },
  ["home-page-data"],
  { revalidate: 300 },
);

export default async function Home() {
  let blogs: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    createdAt: Date;
    publishedAt: Date | null;
    author: { firstName: string; lastName: string } | null;
  }> = [];
  let galleries: Array<{
    id: string;
    title: string;
    images: Array<{ id: string; imageUrl: string }>;
  }> = [];
  let heroSlides: Array<{ title: string; imageUrl: string }> = [];

  try {
    const homeData = await getCachedHomeData();
    blogs = homeData.blogs;
    galleries = homeData.galleries;
    heroSlides = homeData.heroSlides;
  } catch (error) {
    console.error("Home page data fetch failed:", error);
  }

  const dedupedDynamicGalleries = galleries
    .filter((gallery) => gallery.images.length > 0)
    .filter((gallery) => gallery.title.trim() !== "مشهد ۱۴۰۴")
    .filter((gallery, index, array) => array.findIndex((item) => item.title === gallery.title) === index)
    .slice(0, 1);

  const culturalImages = [
    "https://emam-reza-group.vercel.app/api/uploads/cmvqku3ds0000l8087aedgyqp",
    "https://emam-reza-group.vercel.app/api/uploads/cmvqkugf70001l808hdqwu7ia",
    "https://emam-reza-group.vercel.app/api/uploads/cmvql3ivk0001l207d4ruvkij",
    "https://emam-reza-group.vercel.app/api/uploads/cmvql35xt0000l207ddy3v8j8",
  ];

  const campImages = [
    "https://emam-reza-group.vercel.app/api/uploads/cmue3gdj70000js0468dz3zdy",
    "https://emam-reza-group.vercel.app/api/uploads/cmue3gwfb0001js04bfnfhgrb",
    "https://emam-reza-group.vercel.app/api/uploads/cmvqmwqej0000l2088g187u7m",
  ];

  const sportImages = [
    "https://emam-reza-group.vercel.app/api/uploads/cmvqmjtgd0001ji08z47gklf2",
    "https://emam-reza-group.vercel.app/api/uploads/cmvqmjjip0000ji084wt2fo5c",
    "https://emam-reza-group.vercel.app/api/uploads/cmvqlmw0l0001l207ulk3txcc",
    "https://emam-reza-group.vercel.app/api/uploads/cmvqlmnkf0000l207wsve83wl",
    "https://emam-reza-group.vercel.app/api/uploads/cmvqlmf9m0001jp08devucc6m",
    "https://emam-reza-group.vercel.app/api/uploads/cmvqlm6520000jp08plqhh9n1",
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:space-y-16 md:py-10">
        <HeroSlider slides={heroSlides} />

        <h1 className="text-xl font-black leading-tight text-emerald-700 md:text-4xl">
          معرفی گروه فرهنگی امام رضا(ع)
        </h1>

        <section className="rounded-3xl bg-white p-4 shadow-md md:p-10">
          <div className="grid gap-5 md:grid-cols-2 md:items-center md:gap-8">
            <div>
              <h2 className="text-lg font-black leading-tight text-emerald-900 md:text-3xl">
                فعالیت تربیتی
              </h2>
              <ul className="mt-4 list-disc space-y-2 pr-5 text-sm leading-6 text-zinc-700 marker:text-emerald-700 md:text-base md:leading-8">
                <li>برگزاری نماز های جماعت</li>
                <li>درس اخلاق</li>
                <li>برگزاری کلاس های مختلف اعتقادی قرآنی مهارتی</li>
                <li>توضیح و تبیین دقیق سیره شهدا</li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://emam-reza-group.vercel.app/api/uploads/cmvqk7tqw0000id0886aknsob"
                alt="فعالیت تربیتی"
                className="h-64 w-64 rounded-full border border-emerald-100 object-cover shadow-sm md:h-72 md:w-72"
              />
              <p className="mt-4 w-64 text-center text-sm font-semibold text-emerald-900 md:w-72 md:text-lg">درس اخلاق</p>
              <p className="mt-1 w-64 text-center text-base font-black text-emerald-900 md:w-72 md:text-xl">آیت الله عطری نژاد</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 border-t border-emerald-100 pt-5 md:mt-10 md:gap-8 md:pt-8 md:grid-cols-5 md:items-start">
            <div className="order-2 grid grid-cols-2 justify-items-center gap-4 md:order-1 md:col-span-2">
              {culturalImages.map((imageUrl, index) => (
                <div key={imageUrl} className="overflow-hidden rounded-[12px] border border-emerald-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={`فعالیت فرهنگی ${index + 1}`}
                    className="h-[150px] w-[200px] object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="order-1 md:order-2 md:col-span-3">
              <h2 className="text-lg font-black leading-tight text-emerald-900 md:text-3xl">فرهنگی</h2>
              <ul className="mt-4 list-disc space-y-2 pr-5 text-sm leading-6 text-zinc-700 marker:text-emerald-700 md:text-base md:leading-8">
                <li>تاسیس گروه سرود و دکلمه خوانی تخصصی (( آوای رئوف ))</li>
                <li>برگزاری هیئت هفتگی در شب های جمعه</li>
                <li>گرامیداشت ایام منسوب به اهل بیت علیهم السلام نظیر ولادت ها و شهادت ها</li>
                <li>بزرگداشت مراسمات ملی</li>
                <li>برگزاری یادواره شهدا</li>
                <li>محافل انس قرآن</li>
                <li>تجهیز کتابخانه بزرگ گوهرشاد و برگزاری مسابقات کتاب خوانی</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-5 border-t border-emerald-100 pt-5 md:mt-10 md:gap-8 md:pt-8 md:grid-cols-2 md:items-start">
            <div className="order-2 md:order-1">
              <h2 className="text-lg font-black leading-tight text-emerald-900 md:text-3xl">ورزشی</h2>
              <ul className="mt-4 list-disc space-y-2 pr-5 text-sm leading-6 text-zinc-700 marker:text-emerald-700 md:text-base md:leading-8">
                <li>برگزاری کلاس های ورزشی نظیر جودو، زورخانه و ...</li>
                <li>سانس های هفتگی فوتبال، فوتسال، والیبال، استخر</li>
              </ul>
            </div>
            <div className="order-1 grid grid-cols-3 gap-3 md:order-2">
              {sportImages.map((imageUrl, index) => (
                <div key={imageUrl} className="overflow-hidden rounded-[12px] border border-emerald-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={`فعالیت ورزشی ${index + 1}`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 border-t border-emerald-100 pt-5 md:mt-10 md:gap-8 md:pt-8 md:grid-cols-2 md:items-start">
            <div className="order-1 space-y-3 md:order-1">
              <div className="flex justify-center">
                <div className="w-full max-w-xs overflow-hidden rounded-[12px] border border-emerald-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={campImages[0]} alt="اردو 1" className="h-[120px] w-full object-cover" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {campImages.slice(1).map((imageUrl, index) => (
                  <div key={imageUrl} className="overflow-hidden rounded-[12px] border border-emerald-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={`اردو ${index + 2}`} className="h-[120px] w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <div className="order-2 md:order-2">
              <h2 className="text-lg font-black leading-tight text-emerald-900 md:text-3xl">اردو</h2>
              <ul className="mt-4 list-disc space-y-2 pr-5 text-sm leading-6 text-zinc-700 marker:text-emerald-700 md:text-base md:leading-8">
                <li>اردوهای زیارتی: مشهد، کربلا، قم، جمکران، راهیان نور</li>
                <li>اردوهای تفریحی خارج شهر: شمال، دماوند، شهریار</li>
                <li>اردوهای تفریحی چند روزه: کوه های کلکچال، شیرپلا، دربند، دارآباد</li>
              </ul>
            </div>
          </div>
        </section>
        <section>
          <div className="mb-4 flex items-center justify-end">
            <Link href="/galleries" className="text-xs font-semibold text-emerald-800 hover:underline md:text-sm">
              مشاهده همه
            </Link>
          </div>
          <GallerySectionSliders galleries={dedupedDynamicGalleries} />
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-md md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-emerald-900 md:text-2xl">جدیدترین روایت‌ها</h2>
            <Link href="/blogs" className="text-xs font-semibold text-emerald-800 hover:underline md:text-sm">
              مشاهده همه
            </Link>
          </div>
          {blogs.length === 0 ? (
            <p className="mt-3 text-zinc-600">هنوز روایتی منتشر نشده است.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:mt-6 md:grid-cols-3 md:gap-4">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="rounded-2xl border border-zinc-200 p-4 transition hover:border-emerald-600 hover:shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-zinc-900 md:text-lg">{blog.title}</h3>
                  <p className="mt-2 line-clamp-3 text-xs text-zinc-600 md:text-sm">{blog.excerpt ?? "بدون خلاصه"}</p>
                  <div className="mt-3 space-y-1 text-[11px] text-zinc-500 md:mt-4 md:text-xs">
                    <p className="inline-flex items-center gap-1">
                      <UserRound className="h-3.5 w-3.5" />
                      {blog.author
                        ? `${blog.author.firstName} ${blog.author.lastName}`
                        : "ادمین سایت"}
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatFaDate(blog.publishedAt ?? blog.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
    </div>
  );
}
