import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { homeBannerUpdateSchema } from "@/lib/validations";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return (
    session?.user.role === "ADMIN" ||
    session?.user.role === "SUB_ADMIN" ||
    session?.user.role === "COMMANDER"
  );
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = homeBannerUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "داده بروزرسانی نامعتبر است" },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const banner = await db.homeBanner.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ banner, message: "بنر بروزرسانی شد" });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await context.params;
  await db.homeBanner.delete({ where: { id } });
  return NextResponse.json({ message: "بنر حذف شد" });
}
