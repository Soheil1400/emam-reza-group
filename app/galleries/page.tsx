import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";

import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "گالری‌ها",
  description: "گالری تصاویر گروه فرهنگی امام رضا(ع) همراه با کاور و عنوان هر گالری.",
  canonicalPath: "/galleries",
});

const getCachedGalleries = unstable_cache(
  async () =>
    db.gallery.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { images: true } },
      },
    }),
  ["public-galleries-list"],
  { revalidate: 300 },
);

export default async function GalleriesPage() {
  const galleries = await getCachedGalleries();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <h1 className="text-xl font-black text-emerald-900 md:text-3xl">گالری تصاویر</h1>
      <p className="mt-2 text-xs text-zinc-600 md:text-sm">مجموعه گالری‌های ثبت‌شده گروه فرهنگی امام رضا(ع)</p>

      <section className="mt-5 grid gap-3 md:mt-8 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            href={`/galleries/${gallery.id}`}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-600 hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gallery.coverImageUrl} alt={gallery.title} className="h-52 w-full object-cover" />
            <div className="p-4">
              <h2 className="text-sm font-semibold text-zinc-900 md:text-xl">{gallery.title}</h2>
              <p className="mt-1 text-[11px] text-zinc-500 md:text-xs">تعداد عکس: {gallery._count.images}</p>
            </div>
          </Link>
        ))}
      </section>

      {galleries.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-white p-4 text-xs text-zinc-600 shadow-sm md:mt-8 md:p-6 md:text-sm">فعلا گالری ثبت نشده است.</p>
      ) : null}
    </main>
  );
}
