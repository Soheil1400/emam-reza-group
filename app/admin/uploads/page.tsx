import { ImageUploader } from "@/components/admin/image-uploader";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage() {
  const assets = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayName: true,
      fileName: true,
      createdAt: true,
    },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">مدیریت آپلود تصویر</h1>
      <ImageUploader
        initialHistory={assets.map((asset) => ({
          id: asset.id,
          displayName: asset.displayName ?? asset.fileName,
          fileName: asset.fileName,
          createdAt: asset.createdAt.toISOString(),
          url: `/api/uploads/${asset.id}`,
        }))}
      />
    </section>
  );
}
