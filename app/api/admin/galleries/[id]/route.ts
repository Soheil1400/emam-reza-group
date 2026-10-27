import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { galleryUpdateSchema } from "@/lib/validations";

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
  const payload = await request.json();
  const parsed = galleryUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "داده بروزرسانی نامعتبر است" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const gallery = await db.$transaction(async (tx) => {
    const updated = await tx.gallery.update({
      where: { id },
      data: {
        title: data.title,
        coverImageUrl: data.coverImageUrl,
      },
    });

    if (Array.isArray(data.images)) {
      await tx.galleryImage.deleteMany({ where: { galleryId: id } });
      if (data.images.length > 0) {
        await tx.galleryImage.createMany({
          data: data.images.map((imageUrl, index) => ({
            galleryId: id,
            imageUrl,
            sortOrder: index,
          })),
        });
      }
    }

    return tx.gallery.findUnique({
      where: { id: updated.id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
  });

  return NextResponse.json({ gallery, message: "گالری بروزرسانی شد" });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await context.params;
  await db.gallery.delete({ where: { id } });
  return NextResponse.json({ message: "گالری حذف شد" });
}
