import type { Metadata } from "next";

export const SITE_URL = "https://emam-reza-group.vercel.app";
export const SITE_NAME = "گروه فرهنگی امام رضا(ع)";
export const DEFAULT_DESCRIPTION =
  "گروه فرهنگی امام رضا(ع)؛ روایت‌ها، رویدادها، معرفی حلقه‌ها و فعالیت‌های فرهنگی مسجد.";

export function buildPageMetadata(input: {
  title: string;
  description?: string;
  canonicalPath: string;
}): Metadata {
  const description = input.description ?? DEFAULT_DESCRIPTION;
  return {
    title: input.title,
    description,
    alternates: {
      canonical: input.canonicalPath,
    },
    openGraph: {
      title: input.title,
      description,
      url: input.canonicalPath,
      siteName: SITE_NAME,
      locale: "fa_IR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
    },
  };
}
