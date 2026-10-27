import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "پروفایل",
  description: "تکمیل و مدیریت اطلاعات پروفایل کاربری.",
  canonicalPath: "/profile",
});

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const [profile, circles] = await Promise.all([
    db.user.findUnique({
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
    }),
    db.group.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const initialData = profile
    ? {
        firstName: profile.firstName,
        lastName: profile.lastName,
        nationalCode: profile.nationalCode ?? undefined,
        educationStage: profile.educationStage ?? undefined,
        fatherName: profile.fatherName ?? undefined,
        birthDateJalali: profile.birthDateJalali ?? undefined,
        birthProvince: profile.birthProvince ?? undefined,
        currentCircle: profile.currentCircle ?? undefined,
        personnelPhotoUrl: profile.personnelPhotoUrl ?? undefined,
        idCardPhotoUrl: profile.idCardPhotoUrl ?? undefined,
        discoverSource: profile.discoverSource ?? undefined,
        mobile: profile.mobile ?? undefined,
        motherMobile: profile.motherMobile ?? undefined,
        fatherMobile: profile.fatherMobile ?? undefined,
        homePhone: profile.homePhone ?? undefined,
        fatherJob: profile.fatherJob ?? undefined,
        homeAddress: profile.homeAddress ?? undefined,
      }
    : {};

  return <ProfileForm initialData={initialData} circles={circles.map((circle) => circle.name)} />;
}
