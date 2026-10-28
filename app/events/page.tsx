import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { EventsCards } from "@/components/events/events-cards";
import { authOptions } from "@/lib/auth";
import { db, withDbRetry } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "رویدادها",
  description: "رویدادهای فرهنگی گروه امام رضا(ع) و امکان اعلام حضور در برنامه‌ها.",
  canonicalPath: "/events",
});

function toIsoDateTime(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  return null;
}

async function loadEvents() {
  return withDbRetry(() =>
    db.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    }),
  );
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  let events: Awaited<ReturnType<typeof loadEvents>> = [];
  let loadFailed = false;
  try {
    events = await loadEvents();
  } catch (error) {
    loadFailed = true;
    console.error("Events page data fetch failed:", error);
  }

  let joinedEventIds: string[] = [];
  if (session?.user?.id) {
    try {
      joinedEventIds = (
        await withDbRetry(() =>
          db.eventParticipation.findMany({
            where: {
              userId: session.user.id,
            },
            select: { eventId: true },
          }),
        )
      ).map((item) => item.eventId);
    } catch (error) {
      console.error("Events participation fetch failed:", error);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="rounded-3xl bg-emerald-900 px-6 py-8 text-white">
        <h1 className="text-3xl font-black">رویدادهای فرهنگی</h1>
      </div>

      {loadFailed ? (
        <p className="mt-8 rounded-2xl bg-white p-6 text-zinc-600 shadow-sm">
          بارگذاری رویدادها موقتاً ممکن نیست. لطفاً چند لحظه بعد صفحه را دوباره باز کنید.
        </p>
      ) : null}

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
