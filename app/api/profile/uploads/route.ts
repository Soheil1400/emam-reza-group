import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "نیاز به ورود دارید" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "فایلی ارسال نشده است" }, { status: 400 });
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ message: "حداکثر حجم فایل ۴ مگابایت است" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "فقط فایل تصویری مجاز است" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const asset = await db.mediaAsset.create({
    data: {
      displayName: `profile-${session.user.id}-${Date.now()}-${file.name}`,
      fileName: file.name,
      mimeType: file.type,
      data: base64,
    },
  });

  const origin = new URL(request.url).origin;
  return NextResponse.json(
    {
      url: `${origin}/api/uploads/${asset.id}`,
    },
    { status: 201 },
  );
}
