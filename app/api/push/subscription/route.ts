import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { deletePushSubscription, savePushSubscription } from "@/lib/push";

type SubscriptionPayload = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const payload = (await request.json()) as SubscriptionPayload;

  if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys?.auth) {
    return NextResponse.json({ message: "اطلاعات اشتراک نوتیفیکیشن ناقص است" }, { status: 400 });
  }

  await savePushSubscription({
    endpoint: payload.endpoint,
    p256dh: payload.keys.p256dh,
    auth: payload.keys.auth,
    userId: session?.user?.id ?? null,
  });

  return NextResponse.json({ message: "اشتراک نوتیفیکیشن ذخیره شد" });
}

export async function DELETE(request: Request) {
  const payload = (await request.json()) as { endpoint?: string };

  if (!payload.endpoint) {
    return NextResponse.json({ message: "endpoint ارسال نشده است" }, { status: 400 });
  }

  await deletePushSubscription(payload.endpoint);
  return NextResponse.json({ message: "اشتراک نوتیفیکیشن حذف شد" });
}
