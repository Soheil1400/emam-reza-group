import webpush from "web-push";

import { db } from "@/lib/db";

type PushPayload = {
  title: string;
  body: string;
  url: string;
};

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userId?: string | null;
}) {
  await db.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    update: {
      p256dh: input.p256dh,
      auth: input.auth,
      userId: input.userId ?? null,
    },
    create: {
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userId: input.userId ?? null,
    },
  });
}

export async function deletePushSubscription(endpoint: string) {
  await db.pushSubscription.deleteMany({
    where: { endpoint },
  });
}

export async function broadcastPushNotification(payload: PushPayload) {
  if (!ensureVapidConfigured()) {
    return { sent: 0, skipped: true };
  }

  const subscriptions = await db.pushSubscription.findMany({
    select: { endpoint: true, p256dh: true, auth: true },
  });

  let sent = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload),
        );
        sent += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await deletePushSubscription(subscription.endpoint);
        }
      }
    }),
  );

  return { sent, skipped: false };
}

export async function notifyNewEvent(event: { title: string }) {
  return broadcastPushNotification({
    title: "رویداد جدید ثبت شد",
    body: `«${event.title}» اضافه شد. برای مشاهده جزئیات کلیک کنید.`,
    url: "/events",
  });
}
