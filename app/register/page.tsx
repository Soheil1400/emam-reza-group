import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.trim() ? params.callbackUrl : "/admin";

  return <RegisterForm callbackUrl={callbackUrl} />;
}
