import { AttendanceStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const updateAttendanceSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "UNKNOWN"]),
});

async function ensureEventManagerAccess() {
  const session = await getServerSession(authOptions);
  return (
    session?.user.role === "ADMIN" ||
    session?.user.role === "SUB_ADMIN" ||
    session?.user.role === "COMMANDER" ||
    session?.user.role === "CIRCLE_LEAD" ||
    session?.user.role === "EVENT_MANAGER"
  );
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await ensureEventManagerAccess())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = updateAttendanceSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "داده حضور و غیاب نامعتبر است" }, { status: 400 });
  }

  const { id: eventId } = await context.params;

  const participation = await db.eventParticipation.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: parsed.data.userId,
      },
    },
    select: { id: true },
  });

  if (!participation) {
    return NextResponse.json({ message: "کاربر در این رویداد ثبت‌نام نشده است" }, { status: 404 });
  }

  await db.eventParticipation.update({
    where: { id: participation.id },
    data: {
      attendanceStatus: parsed.data.status as AttendanceStatus,
      attendanceMarkedAt: parsed.data.status === "UNKNOWN" ? null : new Date(),
    },
  });

  return NextResponse.json({ message: "وضعیت حضور و غیاب ذخیره شد" });
}
