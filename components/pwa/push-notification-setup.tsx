"use client";

import { useEffect } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

async function syncSubscription(subscription: PushSubscription | null) {
  if (!subscription) return;
  await fetch("/api/push/subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
}

export function PushNotificationSetup() {
  useEffect(() => {
    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!publicVapidKey) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    let unmounted = false;

    const setup = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        if (Notification.permission === "denied") return;

        const permission: NotificationPermission =
          Notification.permission === "default"
            ? await Notification.requestPermission()
            : Notification.permission;
        if (permission !== "granted") return;

        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          if (!unmounted) await syncSubscription(existing);
          return;
        }

        const nextSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
        if (!unmounted) await syncSubscription(nextSubscription);
      } catch {
        // Intentionally swallow setup errors to avoid breaking page render.
      }
    };

    void setup();
    return () => {
      unmounted = true;
    };
  }, []);

  return null;
}
