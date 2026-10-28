import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const updateUserSchema = z.object({
  group: z.enum(["UNASSIGNED", "A", "B"]).optional(),
  groupId: z.string().nullable().optional(),
  role: z.enum(["USER", "SUB_ADMIN", "COMMANDER", "CIRCLE_LEAD", "EVENT_MANAGER", "ADMIN"]).optional(),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user.role === "ADMIN";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = updateUserSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "داده بروزرسانی نامعتبر است" }, { status: 400 });
  }

  const { id } = await context.params;
  if (!parsed.data.group && !parsed.data.role && parsed.data.groupId === undefined) {
    return NextResponse.json({ message: "چیزی برای بروزرسانی ارسال نشده است" }, { status: 400 });
  }

  await db.user.update({
    where: { id },
    data: {
      ...(parsed.data.group ? { group: parsed.data.group } : {}),
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
      ...(parsed.data.groupId !== undefined ? { groupId: parsed.data.groupId } : {}),
    },
  });

  return NextResponse.json({ message: "کاربر بروزرسانی شد" });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await context.params;
  await db.user.delete({ where: { id } });
  return NextResponse.json({ message: "کاربر حذف شد" });
}
