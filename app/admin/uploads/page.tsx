import { ImageUploader } from "@/components/admin/image-uploader";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage() {
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
      <h1 className="text-lg font-bold md:text-2xl">مدیریت آپلود تصویر</h1>
      <ImageUploader
        initialHistory={assets.map((asset) => ({
          id: asset.id,
          displayName: asset.displayName ?? asset.fileName,
          fileName: asset.fileName,
          createdAt: asset.createdAt.toISOString(),
          url: `${baseUrl}/api/uploads/${asset.id}`,
        }))}
      />
    </section>
  );
}
