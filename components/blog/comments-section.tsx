"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { Snackbar } from "@/components/ui/snackbar";

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

type SessionUser = {
  id: string;
  name?: string | null;
};

export function CommentsSection({
  slug,
  initialComments,
  sessionUser,
}: {
  slug: string;
  initialComments: CommentItem[];
  sessionUser: SessionUser | null;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  const callbackUrl = useMemo(() => `/blog/${slug}#comments`, [slug]);

  function notify(kind: "success" | "error" | "info", message: string) {
    setSnackbar({ show: true, kind, message });
    setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2800);
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) {
      notify("error", "متن نظر را وارد کنید");
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/blogs/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = (await response.json()) as {
      message?: string;
      comment?: { id: string; content: string; createdAt: string };
    };
    setLoading(false);

    if (!response.ok) {
      notify("error", data.message ?? "ثبت نظر ناموفق بود");
      return;
    }

    const newComment: CommentItem = {
      id: data.comment?.id ?? String(Date.now()),
      content: data.comment?.content ?? content,
      createdAt: data.comment?.createdAt ?? new Date().toISOString(),
      user: {
        firstName: sessionUser?.name?.split(" ")[0] ?? "کاربر",
        lastName: sessionUser?.name?.split(" ").slice(1).join(" ") ?? "",
      },
    };

    setComments((prev) => [newComment, ...prev]);
    setContent("");
    notify("success", "نظر شما ثبت شد");
    router.refresh();
  }

  return (
    <section id="comments" className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-emerald-900 md:text-2xl">نظرات</h2>

      {sessionUser ? (
        <form onSubmit={submitComment} className="mt-4 space-y-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={4}
            placeholder="نظر خود را بنویسید..."
            className="w-full rounded-xl border border-zinc-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-70 md:px-4 md:py-2 md:text-sm"
          >
            {loading ? "در حال ثبت..." : "ثبت نظر"}
          </button>
        </form>
      ) : (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700 md:text-sm">
          <p>برای نوشتن نظر، لطفا وارد حساب شوید.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="rounded-lg border border-emerald-700 px-2.5 py-1.5 text-xs text-emerald-700 md:px-3 md:py-2 md:text-sm"
            >
              ورود
            </Link>
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs text-white md:px-3 md:py-2 md:text-sm"
            >
              ثبت نام
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-zinc-600 md:text-sm">هنوز نظری ثبت نشده است.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-xl border border-zinc-200 p-3">
              <p className="text-xs font-medium text-zinc-900 md:text-sm">
                {comment.user.firstName} {comment.user.lastName}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-700 md:text-sm md:leading-7">{comment.content}</p>
              <p className="mt-2 text-[11px] text-zinc-500 md:text-xs">
                {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(
                  new Date(comment.createdAt),
                )}
              </p>
            </article>
          ))
        )}
      </div>
      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </section>
  );
}
