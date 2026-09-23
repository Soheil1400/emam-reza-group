import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return (
    session?.user.role === "ADMIN" ||
    session?.user.role === "SUB_ADMIN" ||
    session?.user.role === "COMMANDER" ||
    session?.user.role === "CIRCLE_LEAD"
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
  const payload = (await request.json()) as { isRegistrationOpen?: boolean };

  if (typeof payload.isRegistrationOpen !== "boolean") {
    return NextResponse.json({ message: "وضعیت ثبت‌نام نامعتبر است" }, { status: 400 });
  }

  const updated = await db.event.update({
    where: { id },
    data: { isRegistrationOpen: payload.isRegistrationOpen },
    select: { id: true, isRegistrationOpen: true },
  });

  return NextResponse.json({
    event: updated,
    message: payload.isRegistrationOpen ? "ثبت‌نام رویداد فعال شد" : "ثبت‌نام رویداد غیرفعال شد",
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
