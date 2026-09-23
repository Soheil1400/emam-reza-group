import Image from "next/image";
import Link from "next/link";
import { CalendarDays, UserRound } from "lucide-react";

import { HeroSlider, TravelCardsSlider } from "@/components/landing/landing-sliders";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const blogs = await db.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-10">
        <HeroSlider />

        <section className="grid gap-8 rounded-3xl bg-white p-6 shadow-md md:grid-cols-2 md:p-10">
          <div>
            <h1 className="text-3xl font-black leading-tight text-emerald-900 md:text-4xl">
              معرفی مجموعه فرهنگی مسجد
            </h1>
            <p className="mt-4 text-base leading-8 text-zinc-700">
              این مجموعه با هدف رشد معنوی، آموزشی و اجتماعی جوانان و خانواده‌ها شکل گرفته و تلاش
              می‌کند با برنامه‌های منظم، فضای پویا و دلنشینی برای همه اعضا فراهم کند.
            </p>
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-emerald-50 p-6">
            <Image src="/vercel.svg" alt="تصویر معرفی" width={180} height={180} className="h-auto" />
          </div>
        </section>

        <TravelCardsSlider />

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
