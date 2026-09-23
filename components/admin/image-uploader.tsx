"use client";

import { Check, Copy, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

import { ImageUrlPreview } from "@/components/ui/image-url-preview";
import { Snackbar } from "@/components/ui/snackbar";

type AssetHistory = {
  id: string;
  displayName: string;
  fileName: string;
  url: string;
  createdAt: string;
};

export function ImageUploader({ initialHistory }: { initialHistory: AssetHistory[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [history, setHistory] = useState<AssetHistory[]>(initialHistory);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  function showMessage(kind: "success" | "error" | "info", message: string) {
    setSnackbar({ show: true, kind, message });
    setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 3000);
  }

  async function loadHistory(showErrorMessage = true) {
    const response = await fetch("/api/admin/uploads");
    const data = (await response.json()) as {
      assets?: AssetHistory[];
      message?: string;
    };

    if (!response.ok) {
      if (showErrorMessage) {
        showMessage("error", data.message ?? "دریافت تاریخچه آپلود ناموفق بود");
      }
      return;
    }
    setHistory(data.assets ?? []);
  }

  async function uploadImage() {
    if (!file) {
      showMessage("error", "ابتدا یک تصویر انتخاب کنید");
      return;
    }
    if (!displayName.trim()) {
      showMessage("error", "نام تصویر را وارد کنید");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("displayName", displayName.trim());

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json()) as {
      url?: string;
      message?: string;
      id?: string;
      displayName?: string;
      fileName?: string;
      createdAt?: string;
    };
    setLoading(false);

    if (!response.ok) {
      showMessage("error", data.message ?? "آپلود ناموفق بود");
      return;
    }

    const url = data.url ?? "";
    setUploadedUrl(url);
    setDisplayName("");
    setFile(null);
    showMessage("success", "تصویر با موفقیت آپلود شد");
    await loadHistory(false);
  }

  async function copyUrl() {
    if (!uploadedUrl) return;
    await navigator.clipboard.writeText(uploadedUrl);
    showMessage("success", "لینک تصویر کپی شد");
  }

  async function updateAssetName(id: string) {
    if (!editingName.trim()) {
      showMessage("error", "نام تصویر را وارد کنید");
      return;
    }

    setPendingId(id);
    const response = await fetch(`/api/admin/uploads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: editingName.trim() }),
    });
    const data = (await response.json()) as { message?: string };
    setPendingId(null);

    if (!response.ok) {
      showMessage("error", data.message ?? "ویرایش نام تصویر ناموفق بود");
      return;
    }

    setEditingId(null);
    setEditingName("");
    showMessage("success", data.message ?? "نام تصویر بروزرسانی شد");
    await loadHistory(false);
  }

  async function deleteAsset(id: string) {
    setPendingId(id);
    const response = await fetch(`/api/admin/uploads/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { message?: string };
    setPendingId(null);

    if (!response.ok) {
      showMessage("error", data.message ?? "حذف تصویر ناموفق بود");
      return;
    }

    if (uploadedUrl.endsWith(`/api/uploads/${id}`)) {
      setUploadedUrl("");
    }
    showMessage("success", data.message ?? "تصویر حذف شد");
    await loadHistory(false);
  }

  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">آپلود تصویر</h2>
      <p className="text-sm text-zinc-600">
        تصویر را آپلود کنید و لینک تولیدشده را داخل سکشن روایت قرار دهید.
      </p>

      <input
        type="text"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="اسم تصویر (مثلا: بنر محرم ۱۴۰۵)"
        className="w-full rounded-xl border border-zinc-300 px-3 py-2"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="w-full rounded-xl border border-zinc-300 p-2"
      />

      <button
        type="button"
        onClick={uploadImage}
        disabled={loading}
        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-70"
      >
        {loading ? "در حال آپلود..." : "آپلود تصویر"}
      </button>
      <button
        type="button"
        onClick={() => loadHistory()}
        className="mr-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm"
      >
        بروزرسانی تاریخچه
      </button>

      {uploadedUrl ? (
        <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-600">لینک تصویر:</p>
          <p className="break-all text-sm text-zinc-900">{uploadedUrl}</p>
          <ImageUrlPreview url={uploadedUrl} alt="پیش نمایش تصویر آپلود شده" className="h-24 w-36" />
          <button
            type="button"
            onClick={copyUrl}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
          >
            کپی لینک
          </button>
        </div>
      ) : null}

      <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <h3 className="text-sm font-semibold text-zinc-800">تاریخچه آپلود</h3>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">هنوز تصویری آپلود نشده است.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id} className="rounded-lg border border-zinc-200 bg-white p-3">
                <p className="text-sm font-medium text-zinc-900">{item.displayName}</p>
                <p className="text-xs text-zinc-500">فایل: {item.fileName}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  تاریخ آپلود:{" "}
                  {new Date(item.createdAt).toLocaleString("fa-IR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-xs text-emerald-700 underline"
                  >
                    {item.url}
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(item.url);
                      showMessage("success", "لینک کپی شد");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2 py-1 text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    کپی
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingName(item.displayName);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2 py-1 text-xs"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAsset(item.id)}
                    disabled={pendingId === item.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {pendingId === item.id ? "..." : "حذف"}
                  </button>
                </div>
                <ImageUrlPreview url={item.url} alt={item.displayName} className="h-20 w-28" />
                {editingId === item.id ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      className="rounded-lg border border-zinc-300 px-2 py-1 text-xs"
                      placeholder="نام جدید تصویر"
                    />
                    <button
                      type="button"
                      onClick={() => updateAssetName(item.id)}
                      disabled={pendingId === item.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-2 py-1 text-xs text-emerald-700 disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" />
                      ذخیره
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2 py-1 text-xs"
                    >
                      <X className="h-3.5 w-3.5" />
                      انصراف
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </section>
  );
}
