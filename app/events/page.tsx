import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { getServerSession } from "next-auth";

import { EventsCards } from "@/components/events/events-cards";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "رویدادها",
  description: "رویدادهای فرهنگی گروه امام رضا(ع) و امکان اعلام حضور در برنامه‌ها.",
  canonicalPath: "/events",
});

function toIsoDateTime(value: Date | string | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

const getCachedEvents = unstable_cache(
  async () =>
    db.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    }),
  ["public-events-list"],
  { revalidate: 60 },
);

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  const events = await getCachedEvents();

  const joinedEventIds = session?.user?.id
    ? (
        await db.eventParticipation.findMany({
          where: {
            userId: session.user.id,
          },
          select: { eventId: true },
        })
      ).map((item) => item.eventId)
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="rounded-3xl bg-emerald-900 px-6 py-8 text-white">
        <h1 className="text-3xl font-black">رویدادهای فرهنگی</h1>
      </div>

      <EventsCards
        events={events.map((event) => ({
          id: event.id,
          title: event.title,
          imageUrl: event.imageUrl,
          description: event.description,
          location: event.location,
          eventTime: toIsoDateTime(event.eventTime),
          isRegistrationOpen: event.isRegistrationOpen,
          participantsCount: event._count.participants,
        }))}
        joinedEventIds={joinedEventIds}
        isLoggedIn={Boolean(session?.user)}
      />
    </main>
  );
}
