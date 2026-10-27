"use client";

import { ImageUp } from "lucide-react";
import { useRef, useState } from "react";

type UploadResponse = {
  url?: string;
  message?: string;
};

const MAX_UPLOAD_SIZE_BYTES = 4 * 1024 * 1024;
const FILE_SIZE_ERROR_MESSAGE = "حداکثر حجم فایل ۴ مگابایت است";

export function ImageUrlInput({
  value,
  onChange,
  placeholder,
  uploadNamePrefix,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  uploadNamePrefix: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onPickFile(file: File | null) {
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setError(FILE_SIZE_ERROR_MESSAGE);
      return;
    }
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "displayName",
      `${uploadNamePrefix}-${new Date().toISOString().slice(0, 19)}-${file.name}`,
    );

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });
    const data =
      response.headers.get("content-type")?.includes("application/json")
        ? ((await response.json()) as UploadResponse)
        : ({} as UploadResponse);
    setUploading(false);

    if (!response.ok || !data.url) {
      if (response.status === 413) {
        setError(FILE_SIZE_ERROR_MESSAGE);
        return;
      }
      setError(data.message ?? "آپلود تصویر ناموفق بود");
      return;
    }

    onChange(data.url);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-60 flex-1 rounded-xl border border-zinc-300 px-3 py-2"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void onPickFile(event.target.files?.[0] ?? null);
            event.currentTarget.value = "";
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-xl border border-emerald-700 px-3 py-2 text-sm text-emerald-700 disabled:opacity-70"
        >
          <ImageUp className="h-4 w-4" />
          {uploading ? "در حال آپلود..." : "آپلود مستقیم"}
        </button>
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
