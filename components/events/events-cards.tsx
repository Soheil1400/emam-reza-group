"use client";

import Link from "next/link";
import { CheckCircle2, LogIn, UserMinus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Snackbar } from "@/components/ui/snackbar";

type EventCard = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  location: string | null;
  eventTime: string | null;
  isRegistrationOpen: boolean;
};

export function EventsCards({
  events,
  joinedEventIds,
  isLoggedIn,
}: {
  events: EventCard[];
  joinedEventIds: string[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  const callbackUrl = useMemo(() => "/events", []);
  const joined = useMemo(() => new Set(joinedEventIds), [joinedEventIds]);

  function notify(kind: "success" | "error" | "info", message: string) {
    setSnackbar({ show: true, kind, message });
    setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2800);
  }

  async function toggleParticipation(eventId: string, currentlyJoined: boolean) {
    setPendingId(eventId);
    const response = await fetch(`/api/events/${eventId}/participation`, {
      method: currentlyJoined ? "DELETE" : "POST",
    });
    const data = (await response.json()) as { message?: string };
    setPendingId(null);

    if (!response.ok) {
      notify("error", data.message ?? "عملیات ناموفق بود");
      return;
    }

    notify("success", data.message ?? "انجام شد");
    router.refresh();
  }

  return (
    <>
      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const isJoined = joined.has(event.id);
          const isPending = pendingId === event.id;

          return (
            <article key={event.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.imageUrl} alt={event.title} className="h-52 w-full object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-bold text-zinc-900">{event.title}</h2>
                <p className="mt-2 text-sm leading-7 text-zinc-700">{event.description}</p>
                {event.location ? <p className="mt-1 text-xs text-zinc-600">مکان: {event.location}</p> : null}
                {event.eventTime ? (
                  <p className="mt-1 text-xs text-zinc-600">
                    زمان: {new Date(event.eventTime).toLocaleString("fa-IR")}
                  </p>
                ) : null}

                <div className="mt-4">
                  {isLoggedIn ? (
                    <button
                      type="button"
                      disabled={isPending || (!event.isRegistrationOpen && !isJoined)}
                      onClick={() => toggleParticipation(event.id, isJoined)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-70 ${
                        isJoined
                          ? "bg-rose-600 hover:bg-rose-700"
                          : event.isRegistrationOpen
                            ? "bg-emerald-700 hover:bg-emerald-800"
                            : "bg-zinc-500"
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <UserMinus className="h-4 w-4" />
                          {isPending ? "در حال ثبت..." : "انصراف از حضور"}
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          {isPending
                            ? "در حال ثبت..."
                            : event.isRegistrationOpen
                              ? "شرکت در رویداد"
                              : "ثبت‌نام غیرفعال"}
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-600">
                        برای شرکت در رویداد، وارد حساب شوید.
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-700 px-3 py-2 text-sm text-emerald-700"
                        >
                          <LogIn className="h-4 w-4" />
                          ورود
                        </Link>
                        <Link
                          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white"
                        >
                          ثبت نام
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {isJoined ? (
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    وضعیت شما: شرکت‌کننده
                  </p>
                ) : event.isRegistrationOpen ? null : (
                  <p className="mt-3 text-xs font-medium text-amber-700">ثبت‌نام این رویداد فعلا بسته است.</p>
                )}
              </div>
            </article>
          );
        })}
      </section>
      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </>
  );
}
