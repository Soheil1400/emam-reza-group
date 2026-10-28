import { GroupsManager } from "@/components/admin/groups-manager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminGroupsPage() {
  const groups = await db.group.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-lg font-bold md:text-2xl">مدیریت حلقه‌ها</h1>
      <GroupsManager initialGroups={groups} />
    </section>
  );
}
