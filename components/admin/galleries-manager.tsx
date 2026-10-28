"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ImageUrlInput } from "@/components/admin/image-url-input";
import { ImageUrlPreview } from "@/components/ui/image-url-preview";
import { Snackbar } from "@/components/ui/snackbar";
import { formatFaNumber } from "@/lib/persian";

type GalleryImage = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

type GalleryItem = {
  id: string;
  title: string;
  coverImageUrl: string;
  images: GalleryImage[];
};

export function GalleriesManager({ initialGalleries }: { initialGalleries: GalleryItem[] }) {
  const router = useRouter();
  const [galleries, setGalleries] = useState(initialGalleries);
  const [title, setTitle] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    setTitle("");
    setCoverImageUrl("");
    setImages([""]);
    setEditingId(null);
  }

  async function refreshGalleries() {
    const response = await fetch("/api/admin/galleries");
    const data = (await response.json()) as { galleries?: GalleryItem[]; message?: string };
    if (!response.ok) {
      showMessage("error", data.message ?? "دریافت گالری‌ها ناموفق بود");
      return;
    }
    setGalleries(data.galleries ?? []);
  }

  function updateImageAt(index: number, next: string) {
    setImages((prev) => prev.map((item, current) => (current === index ? next : item)));
  }

  function addImageInput() {
    setImages((prev) => [...prev, ""]);
  }

  function removeImageInput(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, current) => current !== index);
      return next.length > 0 ? next : [""];
    });
  }

  async function saveGallery() {
    setSaving(true);
    const filteredImages = images.map((value) => value.trim()).filter(Boolean);
    const payload = { title, coverImageUrl, images: filteredImages };

    const url = editingId ? `/api/admin/galleries/${editingId}` : "/api/admin/galleries";
    const method = editingId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { message?: string };
    setSaving(false);

    if (!response.ok) {
      showMessage("error", data.message ?? "ذخیره گالری ناموفق بود");
      return;
    }

    resetForm();
    showMessage("success", editingId ? "گالری بروزرسانی شد" : "گالری ایجاد شد");
    await refreshGalleries();
    router.refresh();
  }

  async function deleteGallery(galleryId: string) {
    setPendingDeleteId(galleryId);
    const response = await fetch(`/api/admin/galleries/${galleryId}`, { method: "DELETE" });
    const data = (await response.json()) as { message?: string };
    setPendingDeleteId(null);
    if (!response.ok) {
      showMessage("error", data.message ?? "حذف گالری ناموفق بود");
      return;
    }
    showMessage("success", "گالری حذف شد");
    await refreshGalleries();
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold md:text-xl">{editingId ? "ویرایش گالری" : "ایجاد گالری جدید"}</h2>
        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="عنوان گالری"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2"
          />

          <ImageUrlInput
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            placeholder="لینک عکس کاور گالری"
            uploadNamePrefix="gallery-cover"
          />
          <ImageUrlPreview url={coverImageUrl} alt={title || "کاور گالری"} className="h-28 w-44" />

          <div className="space-y-3 rounded-xl border border-zinc-200 p-3">
            <p className="text-sm font-medium text-zinc-700">عکس‌های گالری</p>
            {images.map((image, index) => (
              <div key={`${index}-${image}`} className="rounded-lg border border-zinc-200 p-2">
                <ImageUrlInput
                  value={image}
                  onChange={(next) => updateImageAt(index, next)}
                  placeholder={`لینک عکس ${formatFaNumber(index + 1)}`}
                  uploadNamePrefix={`gallery-image-${index + 1}`}
                />
                <div className="mt-2 flex items-start justify-between gap-2">
                  <ImageUrlPreview url={image} alt={`عکس ${index + 1}`} className="h-20 w-32" />
                  {images.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeImageInput(index)}
                      className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700"
                    >
                      حذف این عکس
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addImageInput}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              افزودن عکس جدید
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={saveGallery}
            disabled={saving}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-70"
          >
            {saving ? "در حال ذخیره..." : editingId ? "ذخیره تغییرات" : "ایجاد گالری"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm"
            >
              انصراف
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {galleries.map((gallery) => (
          <article key={gallery.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 md:text-lg">{gallery.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">تعداد عکس‌ها: {formatFaNumber(gallery.images.length)}</p>
                <ImageUrlPreview url={gallery.coverImageUrl} alt={gallery.title} className="h-20 w-32" />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(gallery.id);
                    setTitle(gallery.title);
                    setCoverImageUrl(gallery.coverImageUrl);
                    setImages(gallery.images.map((item) => item.imageUrl));
                  }}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  onClick={() => deleteGallery(gallery.id)}
                  disabled={pendingDeleteId === gallery.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-600 px-3 py-1.5 text-sm text-rose-600 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {pendingDeleteId === gallery.id ? "در حال حذف..." : "حذف"}
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
