import Link from "next/link";
import { CalendarDays, UserRound } from "lucide-react";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const blogs = await db.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black text-emerald-900">همه روایت‌ها</h1>
      <p className="mt-2 text-zinc-600">فهرست کامل روایت‌های منتشرشده حلقه فرهنگی.</p>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blog/${blog.slug}`}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-600 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-zinc-900">{blog.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{blog.excerpt ?? "بدون خلاصه"}</p>

            <div className="mt-4 space-y-1 text-xs text-zinc-500">
              <p className="inline-flex items-center gap-1">
                <UserRound className="h-3.5 w-3.5" />
                {blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : "ادمین سایت"}
              </p>
              <p className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
                  blog.publishedAt ?? blog.createdAt,
                )}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {blogs.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-6 text-zinc-600 shadow-sm">هیچ روایتی منتشر نشده است.</p>
      ) : null}
    </main>
  );
}
