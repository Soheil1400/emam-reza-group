import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "معرفی حلقه‌ها",
  description: "معرفی حلقه‌های فرهنگی، آواتار، توضیح و تصاویر فعالیت‌ها.",
  canonicalPath: "/circles",
});

const getCachedCircles = unstable_cache(
  async () =>
    db.group.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ["public-circles-list"],
  { revalidate: 300 },
);

export default async function CirclesPage() {
  const circles = await getCachedCircles();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <h1 className="text-xl font-black text-emerald-900 md:text-3xl">معرفی حلقه‌ها</h1>
      <p className="mt-2 text-xs text-zinc-600 md:text-sm">اطلاعات حلقه‌های فرهنگی و فعالیت‌های آن‌ها</p>

      <section className="mt-5 grid gap-4 md:mt-8 md:grid-cols-2 md:gap-6">
        {circles.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-zinc-600 shadow-sm md:col-span-2">حلقه‌ای ثبت نشده است.</p>
        ) : null}

        {circles.map((circle) => (
          <article key={circle.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              {circle.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={circle.avatarUrl}
                  alt={circle.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  {circle.name.slice(0, 1)}
                </div>
              )}
              <h2 className="text-lg font-bold text-zinc-900 md:text-2xl">{circle.name}</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-700 md:text-base md:leading-8">{circle.description || "توضیحی ثبت نشده است."}</p>

            {circle.imageUrl ? (
              <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={circle.imageUrl} alt={circle.name} className="h-auto w-full object-cover" />
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
