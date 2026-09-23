import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ورود",
  description: "ورود به حساب کاربری با ایمیل یا شماره همراه.",
  canonicalPath: "/login",
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.trim() ? params.callbackUrl : "/";

  return <LoginForm callbackUrl={callbackUrl} />;
}
