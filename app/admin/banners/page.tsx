import { BannersManager } from "@/components/admin/banners-manager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await db.homeBanner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-zinc-900 md:text-2xl">مدیریت بنرهای صفحه اصلی</h2>
      <BannersManager initialBanners={banners} />
    </section>
  );
}
