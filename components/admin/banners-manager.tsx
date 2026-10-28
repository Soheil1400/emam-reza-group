"use client";

import { Edit3, ImagePlus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ImageUrlInput } from "@/components/admin/image-url-input";
import { ImageUrlPreview } from "@/components/ui/image-url-preview";
import { Snackbar } from "@/components/ui/snackbar";

type BannerItem = {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

export function BannersManager({ initialBanners }: { initialBanners: BannerItem[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
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

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setImageUrl("");
    setSortOrder(0);
    setIsActive(true);
  }

  async function refreshBanners() {
    const response = await fetch("/api/admin/banners");
    const data = (await response.json()) as { banners?: BannerItem[]; message?: string };

    if (!response.ok) {
      showMessage("error", data.message ?? "دریافت بنرها ناموفق بود");
      return;
    }
    setBanners(data.banners ?? []);
  }

  async function saveBanner() {
    setSaving(true);
    const isEditing = Boolean(editingId);
    const response = await fetch(isEditing ? `/api/admin/banners/${editingId}` : "/api/admin/banners", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, imageUrl, sortOrder, isActive }),
    });
    const data = (await response.json()) as { message?: string };
    setSaving(false);

    if (!response.ok) {
      showMessage("error", data.message ?? "ذخیره بنر ناموفق بود");
      return;
    }

    showMessage("success", isEditing ? "بنر بروزرسانی شد" : "بنر جدید اضافه شد");
    resetForm();
    await refreshBanners();
    router.refresh();
  }

  async function deleteBanner(id: string) {
    setPendingDeleteId(id);
    const response = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { message?: string };
    setPendingDeleteId(null);

    if (!response.ok) {
      showMessage("error", data.message ?? "حذف بنر ناموفق بود");
      return;
    }

    showMessage("success", "بنر حذف شد");
    await refreshBanners();
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold md:text-xl">{editingId ? "ویرایش بنر" : "افزودن بنر جدید"}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="عنوان بنر"
            className="rounded-xl border border-zinc-300 px-3 py-2"
          />
          <ImageUrlInput
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="لینک تصویر بنر"
            uploadNamePrefix="home-banner"
          />
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
            placeholder="ترتیب نمایش"
            className="rounded-xl border border-zinc-300 px-3 py-2"
          />
          <label className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-zinc-700">فعال باشد</span>
          </label>
        </div>
        <ImageUrlPreview url={imageUrl} alt={title || "بنر"} className="mt-3 h-24 w-full max-w-sm" />
        <button
          type="button"
          onClick={saveBanner}
          disabled={saving}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-70"
        >
          <ImagePlus className="h-4 w-4" />
          {saving ? "در حال ذخیره..." : editingId ? "ذخیره تغییرات بنر" : "افزودن بنر"}
        </button>
        {editingId ? (
          <button
            type="button"
            onClick={resetForm}
            className="mr-2 mt-3 rounded-xl border border-zinc-300 px-4 py-2 text-sm"
          >
            انصراف
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        {banners.map((banner) => (
          <article key={banner.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-900 md:text-lg">{banner.title}</h3>
                <p className="text-xs text-zinc-600">ترتیب نمایش: {banner.sortOrder}</p>
                <p className={`text-xs font-medium ${banner.isActive ? "text-emerald-700" : "text-zinc-500"}`}>
                  وضعیت: {banner.isActive ? "فعال" : "غیرفعال"}
                </p>
                <ImageUrlPreview url={banner.imageUrl} alt={banner.title} className="h-20 w-40" />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(banner.id);
                    setTitle(banner.title);
                    setImageUrl(banner.imageUrl);
                    setSortOrder(banner.sortOrder);
                    setIsActive(banner.isActive);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
                >
                  <Edit3 className="h-4 w-4" />
                  ویرایش
                </button>
                <button
                  type="button"
                  disabled={pendingDeleteId === banner.id}
                  onClick={() => deleteBanner(banner.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-600 px-3 py-1.5 text-sm text-rose-600 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {pendingDeleteId === banner.id ? "در حال حذف..." : "حذف"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </section>
  );
}
