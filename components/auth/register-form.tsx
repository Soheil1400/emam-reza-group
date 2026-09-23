"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Snackbar } from "@/components/ui/snackbar";

type Gender = "MALE" | "FEMALE";

export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "");
    const password = String(formData.get("password") ?? "");
    const payload = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      age: formData.get("age"),
      address: formData.get("address"),
      education: formData.get("education"),
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
      setLoading(false);
      setError(data.message ?? "ثبت نام ناموفق بود");
      setSnackbar({ show: true, message: data.message ?? "ثبت نام ناموفق بود", kind: "error" });
      setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2500);
      return;
    }

    const signInResult = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
      callbackUrl,
    });
    setLoading(false);

    if (signInResult?.error) {
      setMessage("ثبت‌نام انجام شد، لطفا وارد شوید.");
      setSnackbar({ show: true, message: "ثبت‌نام انجام شد؛ حالا وارد شوید", kind: "info" });
      setTimeout(() => router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`), 1000);
      return;
    }

    setMessage("ثبت‌نام و ورود با موفقیت انجام شد.");
    setSnackbar({ show: true, message: "ثبت‌نام با موفقیت انجام شد", kind: "success" });
    router.push(signInResult?.url ?? callbackUrl);
    router.refresh();
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
            <input name="firstName" required className="w-full rounded-xl border border-zinc-300 px-3 py-2" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">نام خانوادگی</span>
            <input name="lastName" required className="w-full rounded-xl border border-zinc-300 px-3 py-2" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">سن</span>
            <input name="age" type="number" min={10} max={100} required className="w-full rounded-xl border border-zinc-300 px-3 py-2" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">تحصیلات</span>
            <input name="education" required className="w-full rounded-xl border border-zinc-300 px-3 py-2" />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-zinc-700">آدرس</span>
            <input name="address" required className="w-full rounded-xl border border-zinc-300 px-3 py-2" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">جنسیت</span>
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value as Gender)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2"
            >
              <option value="MALE">آقا</option>
              <option value="FEMALE">خانم</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">ایمیل یا شماره همراه</span>
            <input
              name="identifier"
              type="text"
              required
              className="w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-zinc-700">رمز عبور (حداقل ۸ کاراکتر)</span>
            <input
              name="password"
              type="password"
              minLength={8}
              required
              className="w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
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
