import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ثبت نام",
  description: "ایجاد حساب کاربری جدید با ایمیل یا شماره همراه.",
  canonicalPath: "/register",
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.trim() ? params.callbackUrl : "/";

  return <RegisterForm callbackUrl={callbackUrl} />;
}
