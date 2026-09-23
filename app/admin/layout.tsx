import { ReactNode } from "react";

import { AdminHeaderNav } from "@/components/admin/admin-header-nav";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-100">
      <AdminHeaderNav email={session.user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
