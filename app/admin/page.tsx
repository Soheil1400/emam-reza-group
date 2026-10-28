import Link from "next/link";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatFaNumber } from "@/lib/persian";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const isEventsOnlyManager = session.user.role === "EVENT_MANAGER";

  if (isEventsOnlyManager) {
    const eventsCount = await db.event.count();

    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-zinc-900">داشبورد</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">کل رویدادها</p>
            <p className="mt-2 text-3xl font-black text-emerald-800">{formatFaNumber(eventsCount)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/events" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white">
            مدیریت رویدادها
          </Link>
        </div>
      </section>
    );
  }

  const [usersCount, blogsCount, publishedBlogsCount, eventsCount, galleriesCount] = await Promise.all([
    db.user.count(),
    db.blogPost.count(),
    db.blogPost.count({ where: { isPublished: true } }),
    db.event.count(),
    db.gallery.count(),
  ]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">داشبورد</h2>
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">کل کاربران</p>
          <p className="mt-2 text-3xl font-black text-emerald-800">{formatFaNumber(usersCount)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">کل روایت‌ها</p>
          <p className="mt-2 text-3xl font-black text-emerald-800">{formatFaNumber(blogsCount)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">روایت منتشرشده</p>
          <p className="mt-2 text-3xl font-black text-emerald-800">{formatFaNumber(publishedBlogsCount)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">کل رویدادها</p>
          <p className="mt-2 text-3xl font-black text-emerald-800">{formatFaNumber(eventsCount)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">کل گالری‌ها</p>
          <p className="mt-2 text-3xl font-black text-emerald-800">{formatFaNumber(galleriesCount)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/blogs/new" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white">
          ایجاد روایت جدید
        </Link>
        <Link href="/admin/users" className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium">
          مدیریت کاربران
        </Link>
        <Link href="/admin/groups" className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium">
          مدیریت حلقه‌ها
        </Link>
        <Link href="/admin/events" className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium">
          مدیریت رویدادها
        </Link>
        <Link href="/admin/galleries" className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium">
          مدیریت گالری
        </Link>
        <Link href="/admin/uploads" className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium">
          آپلود تصویر
        </Link>
        <Link href="/admin/banners" className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium">
          مدیریت بنرها
        </Link>
      </div>
    </section>
  );
}
