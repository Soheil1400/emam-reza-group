import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { canAccessAdminPanel } from "@/lib/admin-permissions";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!canAccessAdminPanel(session.user.role)) {
    redirect("/");
  }

  return session;
}
