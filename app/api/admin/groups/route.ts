import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const groupSchema = z.object({
  name: z.string().trim().min(2, "نام حلقه کوتاه است"),
  description: z.string().trim().optional(),
  avatarUrl: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") return undefined;
      return value;
    },
    z.string().url("لینک آواتار نامعتبر است").optional(),
  ),
  imageUrl: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") return undefined;
      return value;
    },
    z.string().url("لینک تصویر حلقه نامعتبر است").optional(),
  ),
});

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

  const groups = await db.group.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return NextResponse.json({ groups });
}

export async function POST(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = groupSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "داده نامعتبر است" }, { status: 400 });
  }

  const created = await db.group.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      avatarUrl: parsed.data.avatarUrl || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  return NextResponse.json({ group: created }, { status: 201 });
}
