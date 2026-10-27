"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { FormEvent, useState } from "react";

import { Snackbar } from "@/components/ui/snackbar";

type Gender = "MALE" | "FEMALE";

export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [showPassword, setShowPassword] = useState(false);
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
      setMessage("");

      const formData = new FormData(event.currentTarget);
      const identifier = String(formData.get("identifier") ?? "");
      const password = String(formData.get("password") ?? "");
      const payload = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        gender,
        identifier,
        password,
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "ثبت نام ناموفق بود");
        setSnackbar({ show: true, message: data.message ?? "ثبت نام ناموفق بود", kind: "error" });
        setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2500);
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
        callbackUrl: "/profile",
      });

      if (signInResult?.error || !signInResult?.ok) {
        setMessage("ثبت‌نام انجام شد، لطفا وارد شوید.");
        setSnackbar({ show: true, message: "ثبت‌نام انجام شد؛ حالا وارد شوید", kind: "info" });
        setTimeout(() => {
          router.replace("/login");
          router.refresh();
        }, 1000);
        return;
      }

      setMessage("ثبت‌نام و ورود با موفقیت انجام شد.");
      setSnackbar({ show: true, message: "ثبت‌نام با موفقیت انجام شد", kind: "success" });
      router.replace("/profile");
      router.refresh();
    } catch {
      setError("در حال حاضر ثبت نام ممکن نیست. لطفا دوباره تلاش کنید.");
      setSnackbar({ show: true, message: "در حال حاضر ثبت نام ممکن نیست", kind: "error" });
      setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2500);
    } finally {
      setLoading(false);
    }
  }

  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-2xl items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-emerald-900">ثبت نام</h1>
        <p className="mt-2 text-sm text-zinc-600">مشخصات خود را کامل کنید.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">نام</span>
            <div className="relative">
              <input name="firstName" required className="w-full rounded-xl border border-zinc-300 py-2 pr-10 pl-3" />
              <User className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">نام خانوادگی</span>
            <div className="relative">
              <input name="lastName" required className="w-full rounded-xl border border-zinc-300 py-2 pr-10 pl-3" />
              <User className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">جنسیت</span>
            <div className="relative">
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value as Gender)}
                className="w-full appearance-none rounded-xl border border-zinc-300 py-2 pr-3 pl-10"
              >
                <option value="MALE">آقا</option>
                <option value="FEMALE">خانم</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">ایمیل یا شماره همراه</span>
            <div className="relative">
              <input
                name="identifier"
                type="text"
                required
                className="w-full rounded-xl border border-zinc-300 py-2 pr-10 pl-3"
              />
              <Mail className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-zinc-700">رمز عبور (حداقل ۸ کاراکتر)</span>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                minLength={8}
                required
                className="w-full rounded-xl border border-zinc-300 py-2 pr-10 pl-10"
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

          <div className="md:col-span-2">
            {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
            {message ? <p className="mb-2 text-sm text-emerald-700">{message}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-700 px-4 py-2 font-medium text-white transition hover:bg-emerald-800 disabled:opacity-70"
            >
              {loading ? "در حال ثبت..." : "ثبت نام"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-zinc-600">
          حساب دارید؟{" "}
          <Link href={loginHref} className="font-semibold text-emerald-700">
            ورود
          </Link>
        </p>
      </div>
      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </main>
  );
}
