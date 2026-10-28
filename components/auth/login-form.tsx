"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

import { Snackbar } from "@/components/ui/snackbar";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");

      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
        callbackUrl: "/",
      });

      if (result?.error || !result?.ok) {
        setError("ایمیل/شماره همراه یا رمز عبور اشتباه است.");
        setSnackbar({ show: true, message: "ایمیل/شماره همراه یا رمز عبور اشتباه است", kind: "error" });
        setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2500);
        return;
      }

      setSnackbar({ show: true, message: "ورود موفق بود", kind: "success" });
      router.replace("/");
      router.refresh();
    } catch {
      setError("در حال حاضر ورود ممکن نیست. لطفا دوباره تلاش کنید.");
      setSnackbar({ show: true, message: "در حال حاضر ورود ممکن نیست", kind: "error" });
      setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2500);
    } finally {
      setLoading(false);
    }
  }

  const registerHref = `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md items-center px-4 py-6 md:py-10">
      <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-emerald-900 md:text-2xl">ورود</h1>
        <p className="mt-2 text-xs text-zinc-600 md:text-sm">برای دسترسی به حساب کاربری وارد شوید.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-700 md:text-sm">ایمیل یا شماره همراه</span>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 py-2 pr-10 pl-3 outline-none ring-emerald-600 focus:ring"
              />
              <Mail className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-700 md:text-sm">رمز عبور</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 py-2 pr-10 pl-10 outline-none ring-emerald-600 focus:ring"
              />
              <Lock className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 left-2 inline-flex items-center text-zinc-500 transition hover:text-zinc-700"
                aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error ? <p className="text-xs text-red-600 md:text-sm">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-70 md:text-base"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <p className="mt-4 text-xs text-zinc-600 md:text-sm">
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
