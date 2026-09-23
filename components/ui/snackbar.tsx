"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";

type SnackbarKind = "success" | "error" | "info";

const styles: Record<SnackbarKind, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function Snackbar({
  show,
  message,
  kind = "info",
}: {
  show: boolean;
  message: string;
  kind?: SnackbarKind;
}) {
  if (!show || !message) return null;

  const Icon = icons[kind];
  return (
    <div
      className={`fixed bottom-4 right-4 z-[100] inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg ${styles[kind]}`}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
