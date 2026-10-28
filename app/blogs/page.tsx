import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { CalendarDays, UserRound } from "lucide-react";

import { db } from "@/lib/db";
import { formatFaDate } from "@/lib/persian";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "همه روایت‌ها",
  description: "فهرست کامل روایت‌های منتشرشده گروه فرهنگی امام رضا(ع).",
  canonicalPath: "/blogs",
});

const getCachedBlogs = unstable_cache(
  async () =>
    db.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
  ["public-blogs-list"],
  { revalidate: 300 },
);

export default async function BlogsPage() {
  const blogs = await getCachedBlogs();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <h1 className="text-xl font-black text-emerald-900 md:text-3xl">همه روایت‌ها</h1>
      <p className="mt-2 text-xs text-zinc-600 md:text-sm">فهرست کامل روایت‌های منتشرشده حلقه فرهنگی.</p>

      <section className="mt-5 grid gap-3 md:mt-8 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blog/${blog.slug}`}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-600 hover:shadow-md"
          >
            <h2 className="text-sm font-semibold text-zinc-900 md:text-xl">{blog.title}</h2>
            <p className="mt-2 line-clamp-3 text-xs text-zinc-600 md:text-sm">{blog.excerpt ?? "بدون خلاصه"}</p>

            <div className="mt-3 space-y-1 text-[11px] text-zinc-500 md:mt-4 md:text-xs">
              <p className="inline-flex items-center gap-1">
                <UserRound className="h-3.5 w-3.5" />
                {blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : "ادمین سایت"}
              </p>
              <p className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatFaDate(blog.publishedAt ?? blog.createdAt)}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {blogs.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-white p-4 text-xs text-zinc-600 shadow-sm md:mt-8 md:p-6 md:text-sm">هیچ روایتی منتشر نشده است.</p>
      ) : null}
    </main>
  );
}
