"use client";

import Link from "next/link";
import { CalendarDays, LogIn, Menu, Mosque, X } from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/admin/logout-button";

type HeaderSession = {
  name?: string | null;
  role: "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "ADMIN";
} | null;

export function SiteHeader({ session }: { session: HeaderSession }) {
  const [open, setOpen] = useState(false);
  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Mosque className="h-5 w-5 text-emerald-800" />
            <span className="text-sm font-semibold text-emerald-900">گروه فرهنگی امام رضا(ع)</span>
          </Link>

          <button
            type="button"
            className="rounded-lg border border-zinc-300 p-2 md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="باز و بسته کردن منوی هدر"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/circles"
              className="rounded-xl border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
            >
              معرفی حلقه‌ها
            </Link>
            <Link
              href="/blogs"
              className="rounded-xl border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
            >
              همه روایت‌ها
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
            >
              <CalendarDays className="h-4 w-4" />
              رویدادها
            </Link>
            {session ? (
              <>
                {(session.role === "ADMIN" ||
                  session.role === "SUB_ADMIN" ||
                  session.role === "COMMANDER" ||
                  session.role === "CIRCLE_LEAD") && (
                  <Link
                    href="/admin"
                    className="rounded-xl border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
                  >
                    پنل ادمین
                  </Link>
                )}
                <span className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-800">
                  خوش اومدی، {session.name ?? "کاربر"}
                </span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
                >
                  <LogIn className="h-4 w-4" />
                  ورود
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
                >
                  ثبت نام
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="بستن منوی هدر"
            className="absolute inset-y-0 left-0 w-[30%] bg-black/40"
            onClick={closeMenu}
          />
          <nav className="absolute inset-y-0 right-0 w-[70%] overflow-y-auto bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-700">منوی سایت</p>
              <button
                type="button"
                onClick={closeMenu}
                className="rounded-lg border border-zinc-300 p-1.5"
                aria-label="بستن"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/circles" onClick={closeMenu} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm">
                معرفی حلقه‌ها
              </Link>
              <Link href="/blogs" onClick={closeMenu} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm">
                همه روایت‌ها
              </Link>
              <Link
                href="/events"
                onClick={closeMenu}
                className="inline-flex items-center gap-1 rounded-xl border border-zinc-300 px-4 py-2 text-sm"
              >
                <CalendarDays className="h-4 w-4" />
                رویدادها
              </Link>
              {session ? (
                <>
                  {(session.role === "ADMIN" ||
                    session.role === "SUB_ADMIN" ||
                    session.role === "COMMANDER" ||
                    session.role === "CIRCLE_LEAD") && (
                    <Link href="/admin" onClick={closeMenu} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm">
                      پنل ادمین
                    </Link>
                  )}
                  <span className="rounded-xl bg-emerald-100 px-4 py-2 text-sm text-emerald-800">
                    خوش اومدی، {session.name ?? "کاربر"}
                  </span>
                  <div>
                    <LogoutButton onBeforeSignOut={closeMenu} />
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMenu} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm">
                    ورود
                  </Link>
                  <Link href="/register" onClick={closeMenu} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white">
                    ثبت نام
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
