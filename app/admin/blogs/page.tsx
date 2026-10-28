import Link from "next/link";
import { revalidatePath } from "next/cache";
import { CalendarDays, CheckCircle2, PenSquare, UserRound } from "lucide-react";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { formatFaDate, formatFaNumber } from "@/lib/persian";

export const dynamic = "force-dynamic";

async function removeBlog(formData: FormData) {
  "use server";

  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blogs");
}

async function togglePublish(formData: FormData) {
  "use server";

  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const currentValue = String(formData.get("isPublished") ?? "false") === "true";
  await db.blogPost.update({
    where: { id },
    data: {
      isPublished: !currentValue,
      publishedAt: !currentValue ? new Date() : null,
    },
  });
  revalidatePath("/admin/blogs");
}

export default async function AdminBlogsPage() {
  const blogs = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sections: true,
      author: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold md:text-2xl">مدیریت روایت</h2>
        <Link href="/admin/blogs/new" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white">
          ایجاد روایت
        </Link>
      </div>

      <div className="space-y-3">
        {blogs.map((blog) => (
          <article key={blog.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold md:text-lg">{blog.title}</h3>
                <p className="text-sm text-zinc-600">{blog.slug}</p>
                <p className="mt-2 text-sm text-zinc-500">تعداد سکشن: {formatFaNumber(blog.sections.length)}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500">
                  <UserRound className="h-3.5 w-3.5" />
                  {blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : "نامشخص"}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatFaDate(blog.publishedAt ?? blog.createdAt)}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {blog.isPublished ? "منتشر شده" : "پیش‌نویس"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/blog/${blog.slug}`}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  مشاهده
                </Link>
                <Link
                  href={`/admin/blogs/new?edit=${blog.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <PenSquare className="h-4 w-4" />
                  ویرایش
                </Link>
                <form action={togglePublish}>
                  <input type="hidden" name="id" value={blog.id} />
                  <input type="hidden" name="isPublished" value={String(blog.isPublished)} />
                  <button className="rounded-lg border border-emerald-700 px-3 py-2 text-sm text-emerald-700">
                    {blog.isPublished ? "خارج از انتشار" : "انتشار"}
                  </button>
                </form>
                <form action={removeBlog}>
                  <input type="hidden" name="id" value={blog.id} />
                  <button className="rounded-lg border border-rose-600 px-3 py-2 text-sm text-rose-600">
                    حذف
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}

        {blogs.length === 0 ? <p className="text-zinc-600">فعلا هیچ روایتی ثبت نشده است.</p> : null}
      </div>
    </section>
  );
}
