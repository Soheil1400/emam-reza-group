import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeDigits, normalizePhone } from "@/lib/identity";
import { profileSchema } from "@/lib/validations";

function normalizeDateJalali(value: string) {
  const digits = normalizeDigits(value);
  return digits.replace(/-/g, "/");
}

function normalizeNationalCode(value: string) {
  return normalizeDigits(value).replace(/\D/g, "");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "نیاز به ورود دارید" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      nationalCode: true,
      educationStage: true,
      fatherName: true,
      birthDateJalali: true,
      birthProvince: true,
      currentCircle: true,
      personnelPhotoUrl: true,
      idCardPhotoUrl: true,
      discoverSource: true,
      mobile: true,
      motherMobile: true,
      fatherMobile: true,
      homePhone: true,
      fatherJob: true,
      homeAddress: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "کاربر یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({ profile: user });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "نیاز به ورود دارید" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const payload = {
    ...body,
    nationalCode: normalizeNationalCode(String(body.nationalCode ?? "")),
    birthDateJalali: normalizeDateJalali(String(body.birthDateJalali ?? "")),
    mobile: normalizePhone(String(body.mobile ?? "")),
    motherMobile: normalizePhone(String(body.motherMobile ?? "")),
    fatherMobile: normalizePhone(String(body.fatherMobile ?? "")),
    homePhone: normalizeDigits(String(body.homePhone ?? "")).replace(/\D/g, ""),
  };

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "داده نامعتبر است" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  await db.user.update({
    where: { id: session.user.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      nationalCode: data.nationalCode,
      educationStage: data.educationStage,
      fatherName: data.fatherName,
      birthDateJalali: data.birthDateJalali,
      birthProvince: data.birthProvince,
      currentCircle: data.currentCircle,
      personnelPhotoUrl: data.personnelPhotoUrl,
      idCardPhotoUrl: data.idCardPhotoUrl,
      discoverSource: data.discoverSource,
      mobile: data.mobile,
      motherMobile: data.motherMobile,
      fatherMobile: data.fatherMobile,
      homePhone: data.homePhone,
      fatherJob: data.fatherJob,
      homeAddress: data.homeAddress,
      address: data.homeAddress,
    },
  });

  return NextResponse.json({ message: "پروفایل با موفقیت ذخیره شد" });
}
