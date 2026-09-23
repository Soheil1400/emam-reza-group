import type { Metadata } from "next";
import { ReactNode } from "react";

import { AdminHeaderNav } from "@/components/admin/admin-header-nav";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "پنل ادمین",
  description: "پنل مدیریت داخلی گروه فرهنگی امام رضا(ع)",
  alternates: { canonical: "/admin" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
      "max-video-preview": -1,
      "max-image-preview": "none",
    },
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-100">
      <AdminHeaderNav email={session.user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
