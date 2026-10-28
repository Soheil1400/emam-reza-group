"use client";

import { useMemo, useState } from "react";

export function ImageUrlPreview({
  url,
  alt,
  className = "h-28 w-44",
}: {
  url?: string | null;
  alt?: string;
  className?: string;
}) {
  const normalized = useMemo(() => url?.trim() ?? "", [url]);
  const [failed, setFailed] = useState(false);

  if (!normalized) return null;

  const isLikelyUrl = /^https?:\/\//i.test(normalized) || normalized.startsWith("/");
  if (!isLikelyUrl) {
    return <p className="mt-2 text-xs text-amber-700">فرمت لینک تصویر معتبر نیست.</p>;
  }

  if (failed) {
    return <p className="mt-2 text-xs text-rose-600">پیش‌نمایش تصویر قابل نمایش نیست.</p>;
  }

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={normalized}
        alt={alt ?? "پیش نمایش تصویر"}
        className={`${className} max-w-full rounded-lg object-cover`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
