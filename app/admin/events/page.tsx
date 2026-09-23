import { EventsManager } from "@/components/admin/events-manager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await db.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              managedGroup: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900">مدیریت رویدادها</h2>
      <EventsManager
        initialEvents={events.map((event) => ({
          id: event.id,
          title: event.title,
          imageUrl: event.imageUrl,
          description: event.description,
          isRegistrationOpen: event.isRegistrationOpen,
          participants: event.participants.map((item) => ({
            id: item.user.id,
            firstName: item.user.firstName,
            lastName: item.user.lastName,
            groupName: item.user.managedGroup?.name ?? null,
          })),
        }))}
      />
    </section>
  );
}
