import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const gallery = await db.gallery.findUnique({
    where: { id },
    select: { title: true },
  });

  if (!gallery) {
    return {
      title: "گالری یافت نشد",
      description: DEFAULT_DESCRIPTION,
      alternates: { canonical: `/galleries/${id}` },
      robots: { index: false, follow: false },
    };
  }

  const description = `مشاهده تصاویر گالری «${gallery.title}» در ${SITE_NAME}`;
  return {
    title: gallery.title,
    description,
    alternates: { canonical: `/galleries/${id}` },
    openGraph: {
      title: gallery.title,
      description,
      type: "article",
      locale: "fa_IR",
      siteName: SITE_NAME,
      url: `/galleries/${id}`,
    },
  };
}

export default async function GalleryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gallery = await db.gallery.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!gallery) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black text-emerald-900">{gallery.title}</h1>
      <p className="mt-2 text-zinc-600">همه تصاویر این گالری</p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gallery.images.map((image) => (
          <figure key={image.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.imageUrl} alt={gallery.title} className="h-56 w-full object-cover" />
          </figure>
        ))}
      </section>

      {gallery.images.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-6 text-zinc-600 shadow-sm">این گالری عکسی ندارد.</p>
      ) : null}
    </main>
  );
}
