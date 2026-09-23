import { UsersManager } from "@/components/admin/users-manager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, groups] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        address: true,
        education: true,
        email: true,
        role: true,
        group: true,
        groupId: true,
      },
    }),
    db.group.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">مدیریت کاربران ثبت‌نام‌شده</h2>
      <UsersManager users={users} groups={groups} />
    </section>
  );
}
