"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = useMemo(
    () => `${pathname}?${searchParams?.toString() ?? ""}`,
    [pathname, searchParams],
  );

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const currentRouteRef = useRef(routeKey);
  const loadingRef = useRef(false);

  const clearTrickle = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setVisible(true);
    setProgress(16);
    clearTrickle();
    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev;
        const step = prev < 50 ? 9 : 4;
        return Math.min(88, prev + step);
      });
    }, 180);
  }, [clearTrickle]);

  const complete = useCallback(() => {
    if (!loadingRef.current) return;
    loadingRef.current = false;
    clearTrickle();
    setProgress(100);
    window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 260);
  }, [clearTrickle]);

  useEffect(() => {
    currentRouteRef.current = routeKey;
    complete();
  }, [complete, routeKey]);

  useEffect(() => {
    const shouldStartByUrl = (urlLike: string | URL | null | undefined) => {
      if (!urlLike) return false;
      let nextUrl: URL;
      try {
        nextUrl = new URL(String(urlLike), window.location.href);
      } catch {
        return false;
      }
      if (nextUrl.origin !== window.location.origin) return false;
      const nextKey = `${nextUrl.pathname}${nextUrl.search}`;
      const currentKey = `${window.location.pathname}${window.location.search}`;
      return nextKey !== currentKey;
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let nextUrl: URL;
      try {
        nextUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (nextUrl.origin !== window.location.origin) return;

      const nextKey = `${nextUrl.pathname}${nextUrl.search}`;
      const currentKey = `${window.location.pathname}${window.location.search}`;
      if (nextKey === currentKey) return;

      start();
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushState(...args) {
      if (shouldStartByUrl(args[2])) {
        start();
      }
      return originalPushState.apply(this, args);
    };
    window.history.replaceState = function replaceState(...args) {
      if (shouldStartByUrl(args[2])) {
        start();
      }
      return originalReplaceState.apply(this, args);
    };

    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      clearTrickle();
    };
  }, [start, clearTrickle]);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[110] h-1 transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <div
        className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.75)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%`, marginLeft: "auto" }}
      />
    </div>
  );
}
