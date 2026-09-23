"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Snackbar } from "@/components/ui/snackbar";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError("ایمیل یا رمز عبور اشتباه است.");
      setSnackbar({ show: true, message: "ایمیل یا رمز عبور اشتباه است", kind: "error" });
      setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2500);
      return;
    }

    setSnackbar({ show: true, message: "ورود موفق بود", kind: "success" });
    router.push(result?.url ?? callbackUrl);
    router.refresh();
  }

  const registerHref = `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-emerald-900">ورود</h1>
        <p className="mt-2 text-sm text-zinc-600">برای دسترسی به حساب کاربری وارد شوید.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">ایمیل</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none ring-emerald-600 focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">رمز عبور</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none ring-emerald-600 focus:ring"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 px-4 py-2 font-medium text-white transition hover:bg-emerald-800 disabled:opacity-70"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-600">
          حساب ندارید؟{" "}
          <Link href={registerHref} className="font-semibold text-emerald-700">
            ثبت نام
          </Link>
        </p>
      </div>
      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </main>
  );
}
