import type { Metadata } from "next";
import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "معرفی حلقه‌ها",
  description: "معرفی حلقه‌های فرهنگی، آواتار، توضیح و تصاویر فعالیت‌ها.",
  canonicalPath: "/circles",
});

export default async function CirclesPage() {
  const circles = await db.group.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black text-emerald-900">معرفی حلقه‌ها</h1>
      <p className="mt-2 text-zinc-600">اطلاعات حلقه‌های فرهنگی و فعالیت‌های آن‌ها</p>

      <section className="mt-8 space-y-6">
        {circles.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-zinc-600 shadow-sm">حلقه‌ای ثبت نشده است.</p>
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
              <h2 className="text-2xl font-bold text-zinc-900">{circle.name}</h2>
            </div>
            <p className="mt-4 leading-8 text-zinc-700">{circle.description || "توضیحی ثبت نشده است."}</p>

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
