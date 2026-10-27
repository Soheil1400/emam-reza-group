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

  const profile = await db.user.findUnique({
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

  return <ProfileForm initialData={profile ?? {}} />;
}
