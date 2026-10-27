"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/admin/logout-button";

const adminLinks = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/blogs", label: "مدیریت روایت" },
  { href: "/admin/users", label: "مدیریت کاربران" },
  { href: "/admin/groups", label: "مدیریت حلقه‌ها" },
  { href: "/admin/events", label: "مدیریت رویدادها" },
  { href: "/admin/galleries", label: "مدیریت گالری" },
  { href: "/admin/uploads", label: "آپلود تصویر" },
];

export function AdminHeaderNav({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-xl font-bold text-emerald-900">پنل ادمین</h1>
          <p className="text-sm text-zinc-600">{email}</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg border border-zinc-300 p-2 md:hidden"
          aria-label="باز و بسته کردن منوی پنل ادمین"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="hidden flex-wrap gap-2 md:flex">
          {adminLinks.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
              {item.label}
            </Link>
          ))}
          <LogoutButton />
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="بستن منوی پنل ادمین"
            className="absolute inset-y-0 left-0 w-[30%] bg-black/40"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute inset-y-0 right-0 w-[70%] overflow-y-auto bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-700">منوی پنل</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-300 p-1.5"
                aria-label="بستن"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {adminLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-sm"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-1">
                <LogoutButton onBeforeSignOut={() => setOpen(false)} />
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
