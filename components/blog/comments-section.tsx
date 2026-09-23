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
      <h2 className="text-2xl font-bold text-emerald-900">نظرات</h2>

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
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
          >
            {loading ? "در حال ثبت..." : "ثبت نظر"}
          </button>
        </form>
      ) : (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          <p>برای نوشتن نظر، لطفا وارد حساب شوید.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="rounded-lg border border-emerald-700 px-3 py-2 text-emerald-700"
            >
              ورود
            </Link>
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="rounded-lg bg-emerald-700 px-3 py-2 text-white"
            >
              ثبت نام
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-zinc-600">هنوز نظری ثبت نشده است.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-xl border border-zinc-200 p-3">
              <p className="text-sm font-medium text-zinc-900">
                {comment.user.firstName} {comment.user.lastName}
              </p>
              <p className="mt-1 text-sm leading-7 text-zinc-700">{comment.content}</p>
              <p className="mt-2 text-xs text-zinc-500">
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
