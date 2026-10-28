import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { cache } from "react";
import { CalendarDays, UserRound } from "lucide-react";

import { CommentsSection } from "@/components/blog/comments-section";
import { authOptions } from "@/lib/auth";
import { db, withDbRetry } from "@/lib/db";
import { formatFaDate } from "@/lib/persian";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const revalidate = 300;

const getBlogPost = cache(async (slug: string) => {
  return withDbRetry(() =>
    db.blogPost.findUnique({
      where: { slug },
      include: {
        sections: { orderBy: { sortOrder: "asc" } },
        author: { select: { firstName: true, lastName: true } },
        comments: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  );
});

function toIsoDateTime(value: unknown) {
  if (!value) return "";
  const parsed = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let post: Awaited<ReturnType<typeof getBlogPost>> = null;
  try {
    post = await getBlogPost(slug);
  } catch (error) {
    console.error("Blog metadata fetch failed:", error);
  }

  if (!post || !post.isPublished) {
    return {
      title: "روایت یافت نشد",
      description: DEFAULT_DESCRIPTION,
      alternates: { canonical: `/blog/${slug}` },
      robots: { index: false, follow: false },
    };
  }

  const description = post.excerpt?.trim() || `مطالعه روایت «${post.title}» در ${SITE_NAME}`;
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `/blog/${slug}`,
      type: "article",
      locale: "fa_IR",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  let post: Awaited<ReturnType<typeof getBlogPost>> = null;
  try {
    post = await getBlogPost(slug);
  } catch (error) {
    console.error("Blog page data fetch failed:", error);
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-6 md:py-10">
        <p className="rounded-2xl bg-white p-4 text-xs text-zinc-600 shadow-sm md:p-6 md:text-sm">
          بارگذاری این روایت موقتاً ممکن نیست. لطفاً چند لحظه بعد صفحه را دوباره باز کنید.
        </p>
      </main>
    );
  }

  if (!post || !post.isPublished) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 md:py-10">
      <article className="space-y-5 md:space-y-8">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black text-emerald-900 md:text-3xl">{post.title}</h1>
          {post.excerpt ? <p className="mt-3 text-sm leading-6 text-zinc-700 md:text-base md:leading-8">{post.excerpt}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-600 md:text-sm">
            <div className="inline-flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                  post.author
                    ? `${post.author.firstName} ${post.author.lastName}`
                    : "Admin",
                )}`}
                alt="avatar"
                className="h-8 w-8 rounded-full bg-zinc-100"
              />
              <span className="inline-flex items-center gap-1">
                <UserRound className="h-4 w-4" />
                {post.author ? `${post.author.firstName} ${post.author.lastName}` : "ادمین سایت"}
              </span>
            </div>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {formatFaDate(post.publishedAt ?? post.createdAt, { dateStyle: "full" })}
            </span>
          </div>
        </header>

        {post.sections.map((section) => {
          const content =
            typeof section.content === "object" && section.content ? section.content : {};
          const title = String((content as Record<string, unknown>).title ?? "");
          const text = String((content as Record<string, unknown>).text ?? "");
          const imageUrl = String((content as Record<string, unknown>).imageUrl ?? "");

          return (
            <section key={section.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 md:text-2xl">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-700 md:text-base md:leading-8">{text}</p>

              {section.type === "TEXT_IMAGE" && imageUrl ? (
                <div className="mt-5 overflow-hidden rounded-2xl bg-zinc-100 p-3">
                  {/* Using plain img so admins can use any trusted URL without Next image domain config. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={title}
                    className="h-auto w-full rounded-xl object-cover"
                  />
                </div>
              ) : null}
            </section>
          );
        })}

        <CommentsSection
          slug={slug}
          initialComments={post.comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: toIsoDateTime(comment.createdAt),
            user: {
              firstName: comment.user.firstName,
              lastName: comment.user.lastName,
            },
          }))}
          sessionUser={
            session?.user
              ? {
                  id: session.user.id,
                  name: session.user.name,
                }
              : null
          }
        />
      </article>
    </main>
  );
}
