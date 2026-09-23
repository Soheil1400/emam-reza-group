import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "داده نامعتبر است" },
      { status: 400 },
    );
  }

  const { email, password, ...rest } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "این ایمیل قبلا ثبت شده است" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      ...rest,
      email,
      passwordHash,
    },
  });

  return NextResponse.json({ message: "ثبت‌نام با موفقیت انجام شد" }, { status: 201 });
}
