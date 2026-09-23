import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function isPrivileged(role?: string) {
  return (
    role === "ADMIN" ||
    role === "SUB_ADMIN" ||
    role === "COMMANDER" ||
    role === "CIRCLE_LEAD"
  );
}

async function ensureAccess() {
  const session = await getServerSession(authOptions);
  return session?.user && isPrivileged(session.user.role);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAccess())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await context.params;
  const payload = (await request.json()) as { displayName?: string };
  const displayName = payload.displayName?.trim();

  if (!displayName) {
    return NextResponse.json({ message: "نام تصویر الزامی است" }, { status: 400 });
  }

  const asset = await db.mediaAsset.update({
    where: { id },
    data: { displayName },
    select: {
      id: true,
      displayName: true,
      fileName: true,
      createdAt: true,
    },
  });

  const origin = new URL(request.url).origin;
  return NextResponse.json({
    asset: {
      ...asset,
      displayName: asset.displayName ?? asset.fileName,
      url: `${origin}/api/uploads/${asset.id}`,
    },
    message: "نام تصویر بروزرسانی شد",
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAccess())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await context.params;
  await db.mediaAsset.delete({ where: { id } });
  return NextResponse.json({ message: "تصویر حذف شد" });
}
