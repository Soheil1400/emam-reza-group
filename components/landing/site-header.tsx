"use client";

import Link from "next/link";
import {
  BookOpenText,
  CalendarDays,
  Images,
  LayoutDashboard,
  LogIn,
  Menu,
  Mosque,
  UserCircle2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type HeaderSession = {
  name?: string | null;
  role: "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "EVENT_MANAGER" | "ADMIN";
} | null;

export function SiteHeader({ session }: { session: HeaderSession }) {
  const [open, setOpen] = useState(false);
  function closeMenu() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 md:gap-5">
            <button
              type="button"
              className="rounded-lg border border-zinc-300 p-2 md:hidden"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="باز و بسته کردن منوی هدر"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Mosque className="h-5 w-5 text-emerald-800" />
              <span className="text-sm font-extrabold text-emerald-900 md:text-base">گروه فرهنگی امام رضا(ع)</span>
            </Link>
            <nav className="hidden items-center gap-4 md:flex">
              <Link href="/circles" className="text-sm font-medium text-zinc-700 transition hover:text-emerald-700">
                معرفی حلقه‌ها
              </Link>
              <Link href="/blogs" className="text-sm font-medium text-zinc-700 transition hover:text-emerald-700">
                همه روایت‌ها
              </Link>
              <Link href="/events" className="text-sm font-medium text-zinc-700 transition hover:text-emerald-700">
                رویدادها
              </Link>
              <Link href="/galleries" className="text-sm font-medium text-zinc-700 transition hover:text-emerald-700">
                گالری
              </Link>
            </nav>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {session ? (
              <>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
                >
                  <UserCircle2 className="h-4 w-4" />
                  پروفایل
                </Link>
                {(session.role === "ADMIN" ||
                  session.role === "SUB_ADMIN" ||
                  session.role === "COMMANDER" ||
                  session.role === "CIRCLE_LEAD" ||
                  session.role === "EVENT_MANAGER") && (
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

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ease-out md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="بستن منوی هدر"
          className="absolute inset-y-0 left-0 w-[30%] bg-black/40"
          onClick={closeMenu}
        />
        <nav
          className={`absolute inset-y-0 right-0 w-[70%] overflow-y-auto bg-white p-4 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
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
              <Link
                href="/circles"
                onClick={closeMenu}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              >
                <Users className="h-4 w-4 shrink-0" />
                معرفی حلقه‌ها
              </Link>
              <Link
                href="/blogs"
                onClick={closeMenu}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              >
                <BookOpenText className="h-4 w-4 shrink-0" />
                همه روایت‌ها
              </Link>
              <Link
                href="/events"
                onClick={closeMenu}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              >
                <CalendarDays className="h-4 w-4 shrink-0" />
                رویدادها
              </Link>
              <Link
                href="/galleries"
                onClick={closeMenu}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              >
                <Images className="h-4 w-4 shrink-0" />
                گالری
              </Link>
              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                  >
                    <UserCircle2 className="h-4 w-4 shrink-0" />
                    پروفایل
                  </Link>
                  {(session.role === "ADMIN" ||
                    session.role === "SUB_ADMIN" ||
                    session.role === "COMMANDER" ||
                    session.role === "CIRCLE_LEAD" ||
                    session.role === "EVENT_MANAGER") && (
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                    >
                      <LayoutDashboard className="h-4 w-4 shrink-0" />
                      پنل ادمین
                    </Link>
                  )}
                  <span className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-800">
                    خوش اومدی، {session.name ?? "کاربر"}
                  </span>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                  >
                    <LogIn className="h-4 w-4 shrink-0" />
                    ورود
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-sm text-white"
                  >
                    <UserPlus className="h-4 w-4 shrink-0" />
                    ثبت نام
                  </Link>
                </>
              )}
            </div>
        </nav>
      </div>
    </>
  );
}
