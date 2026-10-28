"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, LogIn, MapPin, UserMinus, UserPlus, Users } from "lucide-react";
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
  participantsCount: number;
};

function formatEventDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString("fa-IR");
}

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
      <section className="mt-5 grid gap-3 md:mt-8 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {events.map((event) => {
          const isJoined = joined.has(event.id);
          const isPending = pendingId === event.id;

          return (
            <article
              key={event.id}
              className="flex flex-col overflow-hidden rounded-3xl bg-white p-3 shadow-sm md:p-0"
            >
              <div className="flex items-start gap-3 md:block">
                <div className="size-28 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 md:h-52 md:w-full md:rounded-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 md:p-4">
                  <h2 className="text-sm font-bold leading-6 text-zinc-900 md:text-xl">{event.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-700 md:mt-2 md:text-sm md:leading-7">{event.description}</p>
                  {event.location ? (
                    <p className="mt-1 inline-flex items-start gap-1 text-[11px] leading-4 text-zinc-600 md:text-xs">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                      <span>مکان: {event.location}</span>
                    </p>
                  ) : null}
                  {event.eventTime ? (() => {
                    const formatted = formatEventDateTime(event.eventTime);
                    if (!formatted) return null;
                    return (
                      <p className="mt-1 inline-flex items-start gap-1 text-[11px] leading-4 text-zinc-600 md:text-xs">
                        <Clock3 className="mt-0.5 h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                        <span>زمان: {formatted}</span>
                      </p>
                    );
                  })() : null}
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] leading-4 text-zinc-600 md:text-xs">
                    <Users className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                    تعداد شرکت‌کننده‌ها: {new Intl.NumberFormat("fa-IR").format(event.participantsCount)}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex justify-end items-end gap-2 md:px-4 md:pb-4">
              {isJoined ? (
                  <p className="mb-1 md:mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 md:text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    وضعیت شما: شرکت‌کننده
                  </p>
                ) : event.isRegistrationOpen ? null : (
                  <p className="text-[11px] font-medium text-amber-700 md:text-xs">ثبت‌نام این رویداد فعلا بسته است.</p>
                )}
                {isLoggedIn ? (
                  <button
                    type="button"
                    disabled={isPending || (!event.isRegistrationOpen && !isJoined)}
                    onClick={() => toggleParticipation(event.id, isJoined)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white disabled:opacity-70 md:gap-2 md:px-4 md:py-2 md:text-sm ${
                      isJoined
                        ? "bg-rose-600 hover:bg-rose-700"
                        : event.isRegistrationOpen
                          ? "bg-emerald-700 hover:bg-emerald-800"
                          : "bg-zinc-500"
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <UserMinus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        {isPending ? "در حال ثبت..." : "انصراف از حضور"}
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        {isPending
                          ? "در حال ثبت..."
                          : event.isRegistrationOpen
                            ? "شرکت در رویداد"
                            : "ثبت‌نام غیرفعال"}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <p className="text-xs text-zinc-600 md:text-xs">
                      برای شرکت در رویداد، وارد حساب شوید.
                    </p>
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-700 px-2.5 py-1.5 text-xs text-emerald-700 md:px-2 md:py-2 md:text-sm"
                    >
                      ورود
                    </Link>
                    <Link
                      href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs text-white md:px-2 md:py-2 md:text-sm"
                    >
                      ثبت نام
                    </Link>
                  </div>
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
