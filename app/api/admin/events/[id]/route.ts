import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventUpdateSchema } from "@/lib/validations";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return (
    session?.user.role === "ADMIN" ||
    session?.user.role === "SUB_ADMIN" ||
    session?.user.role === "COMMANDER" ||
    session?.user.role === "CIRCLE_LEAD" ||
    session?.user.role === "EVENT_MANAGER"
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await context.params;
  const payload = await request.json();
  const parsed = eventUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "داده بروزرسانی نامعتبر است" },
      { status: 400 },
    );
  }

  const updated = await db.event.update({
    where: { id },
    data: parsed.data,
  });

  const isRegistrationToggleOnly =
    Object.keys(parsed.data).length === 1 && typeof parsed.data.isRegistrationOpen === "boolean";

  return NextResponse.json({
    event: updated,
    message: isRegistrationToggleOnly
      ? parsed.data.isRegistrationOpen
        ? "ثبت‌نام رویداد فعال شد"
        : "ثبت‌نام رویداد غیرفعال شد"
      : "رویداد با موفقیت بروزرسانی شد",
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await context.params;
  await db.event.delete({ where: { id } });
  return NextResponse.json({ message: "رویداد حذف شد" });
}
