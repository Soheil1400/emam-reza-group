import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { gallerySchema } from "@/lib/validations";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return (
    session?.user.role === "ADMIN" ||
    session?.user.role === "SUB_ADMIN" ||
    session?.user.role === "COMMANDER" ||
    session?.user.role === "CIRCLE_LEAD"
  );
}

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const galleries = await db.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return NextResponse.json({ galleries });
}

export async function POST(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = gallerySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "داده نامعتبر است" },
      { status: 400 },
    );
  }

  const gallery = await db.gallery.create({
    data: {
      title: parsed.data.title,
      coverImageUrl: parsed.data.coverImageUrl,
      images: {
        create: parsed.data.images.map((imageUrl, index) => ({
          imageUrl,
          sortOrder: index,
        })),
      },
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json({ gallery }, { status: 201 });
}
