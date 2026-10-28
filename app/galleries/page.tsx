import type { Metadata } from "next";
import Link from "next/link";

import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const metadata: Metadata = buildPageMetadata({
  title: "گالری‌ها",
  description: "گالری تصاویر گروه فرهنگی امام رضا(ع) همراه با کاور و عنوان هر گالری.",
  canonicalPath: "/galleries",
});

export default async function GalleriesPage() {
  const galleries = await db.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { images: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black text-emerald-900">گالری تصاویر</h1>
      <p className="mt-2 text-zinc-600">مجموعه گالری‌های ثبت‌شده گروه فرهنگی امام رضا(ع)</p>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            href={`/galleries/${gallery.id}`}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-600 hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gallery.coverImageUrl} alt={gallery.title} className="h-52 w-full object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-zinc-900">{gallery.title}</h2>
              <p className="mt-1 text-xs text-zinc-500">تعداد عکس: {gallery._count.images}</p>
            </div>
          </Link>
        ))}
      </section>

      {galleries.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-6 text-zinc-600 shadow-sm">فعلا گالری ثبت نشده است.</p>
      ) : null}
    </main>
  );
}
