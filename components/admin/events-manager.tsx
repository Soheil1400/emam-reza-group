"use client";

import { Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Snackbar } from "@/components/ui/snackbar";
import { ImageUrlPreview } from "@/components/ui/image-url-preview";
import { formatFaNumber } from "@/lib/persian";

type EventParticipant = {
  id: string;
  firstName: string;
  lastName: string;
  groupName: string | null;
};

type EventItem = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  isRegistrationOpen: boolean;
  participants: EventParticipant[];
};

export function EventsManager({ initialEvents }: { initialEvents: EventItem[] }) {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  function showMessage(kind: "success" | "error" | "info", message: string) {
    setSnackbar({ show: true, kind, message });
    setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 3000);
  }

  async function refreshEvents() {
    const response = await fetch("/api/admin/events");
    const data = (await response.json()) as {
      events?: Array<{
        id: string;
        title: string;
        imageUrl: string;
        description: string;
        isRegistrationOpen: boolean;
        participants: Array<{
          user: {
            id: string;
            firstName: string;
            lastName: string;
            managedGroup: { name: string } | null;
          };
        }>;
      }>;
      message?: string;
    };

    if (!response.ok) {
      showMessage("error", data.message ?? "دریافت رویدادها ناموفق بود");
      return;
    }

    setEvents(
      (data.events ?? []).map((event) => ({
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
      })),
    );
  }

  async function createEvent() {
    setSaving(true);
    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        imageUrl,
        description,
        isRegistrationOpen: true,
      }),
    });
    const data = (await response.json()) as { message?: string };
    setSaving(false);

    if (!response.ok) {
      showMessage("error", data.message ?? "ایجاد رویداد ناموفق بود");
      return;
    }

    setTitle("");
    setImageUrl("");
    setDescription("");
    showMessage("success", "رویداد با موفقیت ایجاد شد");
    await refreshEvents();
    router.refresh();
  }

  async function toggleRegistration(eventId: string, nextState: boolean) {
    const response = await fetch(`/api/admin/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRegistrationOpen: nextState }),
    });
    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      showMessage("error", data.message ?? "تغییر وضعیت ناموفق بود");
      return;
    }

    showMessage("success", data.message ?? "وضعیت ثبت‌نام بروزرسانی شد");
    await refreshEvents();
    router.refresh();
  }

  async function deleteEvent(eventId: string) {
    setPendingDeleteId(eventId);
    const response = await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
    const data = (await response.json()) as { message?: string };
    setPendingDeleteId(null);

    if (!response.ok) {
      showMessage("error", data.message ?? "حذف رویداد ناموفق بود");
      return;
    }

    showMessage("success", "رویداد حذف شد");
    await refreshEvents();
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">ایجاد رویداد جدید</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="عنوان رویداد"
            className="rounded-xl border border-zinc-300 px-3 py-2"
          />
          <input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="لینک تصویر رویداد"
            className="rounded-xl border border-zinc-300 px-3 py-2"
          />
        </div>
        <ImageUrlPreview url={imageUrl} alt={title || "رویداد"} />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="توضیحات رویداد"
          rows={4}
          className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2"
        />
        <button
          type="button"
          onClick={createEvent}
          disabled={saving}
          className="mt-3 rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-70"
        >
          {saving ? "در حال ذخیره..." : "ایجاد رویداد"}
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <article key={event.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{event.title}</h3>
                <p className="mt-2 text-sm text-zinc-700">{event.description}</p>
                <p className="mt-1 text-xs text-zinc-500">لینک تصویر: {event.imageUrl}</p>
                <ImageUrlPreview url={event.imageUrl} alt={event.title} className="h-24 w-36" />
                <p className="mt-1 text-xs text-zinc-500">
                  وضعیت ثبت‌نام: {event.isRegistrationOpen ? "فعال" : "غیرفعال"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleRegistration(event.id, !event.isRegistrationOpen)}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    event.isRegistrationOpen
                      ? "border border-amber-600 text-amber-700"
                      : "border border-emerald-700 text-emerald-700"
                  }`}
                >
                  {event.isRegistrationOpen ? "غیرفعال‌کردن ثبت‌نام" : "فعال‌کردن ثبت‌نام"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteEvent(event.id)}
                  disabled={pendingDeleteId === event.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-600 px-3 py-1.5 text-sm text-rose-600 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {pendingDeleteId === event.id ? "در حال حذف..." : "حذف"}
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-zinc-200 p-3">
              <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-zinc-800">
                <Users className="h-4 w-4" />
                افراد شرکت‌کننده ({formatFaNumber(event.participants.length)})
              </p>
              {event.participants.length > 0 ? (
                <ul className="space-y-2">
                  {event.participants.map((participant) => (
                    <li key={participant.id} className="flex flex-wrap items-center gap-2 text-sm">
                      <span>{`${participant.firstName} ${participant.lastName}`}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                        {participant.groupName ? `حلقه ${participant.groupName}` : "حلقه بدون انتساب"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">فعلا کسی شرکت نکرده است.</p>
              )}
            </div>
          </article>
        ))}
      </div>
      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </section>
  );
}
