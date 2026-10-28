import { GalleriesManager } from "@/components/admin/galleries-manager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminGalleriesPage() {
  const galleries = await db.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-zinc-900 md:text-2xl">مدیریت گالری</h2>
      <GalleriesManager
        initialGalleries={galleries.map((gallery) => ({
          id: gallery.id,
          title: gallery.title,
          coverImageUrl: gallery.coverImageUrl,
          images: gallery.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            sortOrder: image.sortOrder,
          })),
        }))}
      />
    </section>
  );
}
