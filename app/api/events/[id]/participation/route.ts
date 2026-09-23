import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "برای شرکت در رویداد وارد شوید" }, { status: 401 });
  }

  const { id } = await context.params;
  const event = await db.event.findUnique({
    where: { id },
    select: { id: true, isRegistrationOpen: true },
  });
  if (!event) {
    return NextResponse.json({ message: "رویداد یافت نشد" }, { status: 404 });
  }
  if (!event.isRegistrationOpen) {
    return NextResponse.json({ message: "ثبت‌نام این رویداد بسته است" }, { status: 400 });
  }

  await db.eventParticipation.upsert({
    where: {
      eventId_userId: {
        eventId: id,
        userId: session.user.id,
      },
    },
    create: {
      eventId: id,
      userId: session.user.id,
    },
    update: {},
  });

  return NextResponse.json({ message: "با موفقیت در رویداد ثبت شدید" });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "برای انصراف ابتدا وارد شوید" }, { status: 401 });
  }

  const { id } = await context.params;
  await db.eventParticipation.deleteMany({
    where: {
      eventId: id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ message: "انصراف از رویداد ثبت شد" });
}
