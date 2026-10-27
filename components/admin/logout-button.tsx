"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton({
  onBeforeSignOut,
  className,
}: {
  onBeforeSignOut?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onBeforeSignOut?.();
        signOut({ callbackUrl: "/" });
      }}
      className={
        className ??
        "inline-flex items-center gap-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100"
      }
    >
      <LogOut className="h-4 w-4" />
      خروج
    </button>
  );
}
