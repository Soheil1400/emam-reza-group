import type { Metadata } from "next";
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

  try {
    [blogs, galleries] = await Promise.all([
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
    ]);
  } catch (error) {
    console.error("Home page data fetch failed:", error);
  }

  const dedupedDynamicGalleries = galleries
    .filter((gallery) => gallery.images.length > 0)
    .filter((gallery) => gallery.title.trim() !== "مشهد ۱۴۰۴")
    .filter((gallery, index, array) => array.findIndex((item) => item.title === gallery.title) === index)
    .slice(0, 1);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-10">
        <HeroSlider />

        <section className="grid gap-8 rounded-3xl bg-white p-6 shadow-md md:grid-cols-2 md:p-10">
          <div>
            <h1 className="text-3xl font-black leading-tight text-emerald-900 md:text-4xl">
              معرفی گروه فرهنگی امام رضا (ع)
            </h1>
            <p className="mt-4 text-base leading-8 text-zinc-700">
              🌺توی این عالم هستی که همش رو به فناست
              <br />
              به خدا یه دل دارم اونم مال امام رضاست ✨
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-emerald-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://masjid-portal-site.vercel.app/api/uploads/cmue3hdl00000il04mmb8s0lj"
              alt="معرفی گروه فرهنگی امام رضا (ع)"
              className="h-full min-h-64 w-full object-cover"
            />
          </div>
        </section>
        <section>
          <div className="mb-4 flex items-center justify-end">
            <Link href="/galleries" className="text-sm font-semibold text-emerald-800 hover:underline">
              مشاهده همه
            </Link>
          </div>
          <GallerySectionSliders galleries={dedupedDynamicGalleries} />
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-emerald-900">جدیدترین روایت‌ها</h2>
            <Link href="/blogs" className="text-sm font-semibold text-emerald-800 hover:underline">
              مشاهده همه
            </Link>
          </div>
          {blogs.length === 0 ? (
            <p className="mt-3 text-zinc-600">هنوز روایتی منتشر نشده است.</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="rounded-2xl border border-zinc-200 p-4 transition hover:border-emerald-600 hover:shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-zinc-900">{blog.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{blog.excerpt ?? "بدون خلاصه"}</p>
                  <div className="mt-4 space-y-1 text-xs text-zinc-500">
                    <p className="inline-flex items-center gap-1">
                      <UserRound className="h-3.5 w-3.5" />
                      {blog.author
                        ? `${blog.author.firstName} ${blog.author.lastName}`
                        : "ادمین سایت"}
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
                        blog.publishedAt ?? blog.createdAt,
                      )}
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
