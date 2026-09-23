import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventSchema } from "@/lib/validations";

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

  const events = await db.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              managedGroup: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = eventSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "داده نامعتبر است" },
      { status: 400 },
    );
  }

  const event = await db.event.create({
    data: parsed.data,
  });

  return NextResponse.json({ event }, { status: 201 });
}
