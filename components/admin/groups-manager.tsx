"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ImageUrlInput } from "@/components/admin/image-url-input";
import { Snackbar } from "@/components/ui/snackbar";
import { ImageUrlPreview } from "@/components/ui/image-url-preview";
import { formatFaNumber } from "@/lib/persian";

type GroupMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type GroupItem = {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  imageUrl: string | null;
  users: GroupMember[];
};

export function GroupsManager({ initialGroups }: { initialGroups: GroupItem[] }) {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupItem[]>(initialGroups);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  function showMessage(kind: "success" | "error" | "info", message: string) {
    setSnackbar({ show: true, kind, message });
    setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 3000);
  }

  async function loadGroups() {
    setLoading(true);
    const response = await fetch("/api/admin/groups");
    const data = (await response.json()) as { groups?: GroupItem[]; message?: string };
    setLoading(false);
    if (!response.ok) {
      showMessage("error", data.message ?? "دریافت حلقه‌ها ناموفق بود");
      return;
    }
    setGroups(data.groups ?? []);
  }

  async function saveGroup() {
    if (!name.trim()) {
      showMessage("error", "نام حلقه الزامی است");
      return;
    }
    setSaving(true);
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/admin/groups/${editingId}` : "/api/admin/groups";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, avatarUrl, imageUrl }),
    });
    const data = (await response.json()) as { message?: string };
    setSaving(false);

    if (!response.ok) {
      showMessage("error", data.message ?? "ذخیره حلقه ناموفق بود");
      return;
    }

    setName("");
    setDescription("");
    setAvatarUrl("");
    setImageUrl("");
    setEditingId(null);
    showMessage("success", "حلقه با موفقیت ذخیره شد");
    await loadGroups();
    router.refresh();
  }

  async function removeGroup(id: string) {
    const response = await fetch(`/api/admin/groups/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) {
      showMessage("error", data.message ?? "حذف حلقه ناموفق بود");
      return;
    }
    showMessage("success", "حلقه حذف شد");
    await loadGroups();
    router.refresh();
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">{editingId ? "ویرایش حلقه" : "تعریف حلقه جدید"}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="نام حلقه"
            className="rounded-xl border border-zinc-300 px-3 py-2"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="توضیح حلقه (اختیاری)"
            className="rounded-xl border border-zinc-300 px-3 py-2"
          />
          <ImageUrlInput
            value={avatarUrl}
            onChange={setAvatarUrl}
            placeholder="لینک آواتار حلقه (اختیاری)"
            uploadNamePrefix="group-avatar"
          />
          <ImageUrlPreview url={avatarUrl} alt="پیش نمایش آواتار حلقه" className="h-20 w-20" />
          <ImageUrlInput
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="لینک تصویر بزرگ حلقه (اختیاری)"
            uploadNamePrefix="group-image"
          />
          <ImageUrlPreview url={imageUrl} alt="پیش نمایش تصویر حلقه" className="h-24 w-40" />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={saveGroup}
            disabled={saving}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-70"
          >
            {saving ? "در حال ذخیره..." : editingId ? "بروزرسانی حلقه" : "ایجاد حلقه"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
                setDescription("");
                setAvatarUrl("");
                setImageUrl("");
              }}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm"
            >
              انصراف
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="rounded-xl bg-white p-4 text-sm text-zinc-600 shadow-sm">در حال بارگذاری حلقه‌ها...</p>
        ) : null}

        {groups.map((group) => (
          <article key={group.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-sm text-zinc-600">{group.description || "بدون توضیح"}</p>
                <p className="mt-2 text-xs text-zinc-500">تعداد اعضا: {formatFaNumber(group.users.length)}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  لینک آواتار: {group.avatarUrl ? group.avatarUrl : "ثبت نشده"}
                </p>
                <ImageUrlPreview url={group.avatarUrl} alt={group.name} className="h-16 w-16" />
                <p className="mt-1 text-xs text-zinc-500">
                  لینک تصویر حلقه: {group.imageUrl ? group.imageUrl : "ثبت نشده"}
                </p>
                <ImageUrlPreview url={group.imageUrl} alt={group.name} className="h-24 w-36" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(group.id);
                    setName(group.name);
                    setDescription(group.description ?? "");
                    setAvatarUrl(group.avatarUrl ?? "");
                    setImageUrl(group.imageUrl ?? "");
                  }}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  className="rounded-lg border border-rose-600 px-3 py-1.5 text-sm text-rose-600"
                >
                  حذف
                </button>
              </div>
            </div>

            {group.users.length > 0 ? (
              <div className="mt-3 rounded-xl border border-zinc-200 p-3 text-sm text-zinc-700">
                <p className="mb-1 font-medium">اعضای این حلقه:</p>
                <ul className="space-y-1">
                  {group.users.map((user) => (
                    <li key={user.id}>{`${user.firstName} ${user.lastName} - ${user.email}`}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">این حلقه فعلا عضو ندارد.</p>
            )}
          </article>
        ))}
      </div>
      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </section>
  );
}
