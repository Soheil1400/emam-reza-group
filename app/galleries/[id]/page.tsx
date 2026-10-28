import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GalleryLightbox } from "@/components/galleries/gallery-lightbox";
import { db } from "@/lib/db";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const revalidate = 300;

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
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <h1 className="text-xl font-black text-emerald-900 md:text-3xl">{gallery.title}</h1>
      <p className="mt-2 text-xs text-zinc-600 md:text-sm">همه تصاویر این گالری</p>

      <GalleryLightbox
        images={gallery.images.map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
        }))}
        title={gallery.title}
      />

      {gallery.images.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-white p-4 text-xs text-zinc-600 shadow-sm md:mt-8 md:p-6 md:text-sm">این گالری عکسی ندارد.</p>
      ) : null}
    </main>
  );
}
