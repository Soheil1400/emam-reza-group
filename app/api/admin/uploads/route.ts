import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function isPrivileged(role?: string) {
  return (
    role === "ADMIN" ||
    role === "SUB_ADMIN" ||
    role === "COMMANDER" ||
    role === "CIRCLE_LEAD"
  );
}

function makeAssetUrl(origin: string, id: string) {
  return `${origin}/api/uploads/${id}`;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isPrivileged(session.user.role)) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const origin = new URL(request.url).origin;
  const assets = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayName: true,
      fileName: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    assets: assets.map((asset) => ({
      id: asset.id,
      displayName: asset.displayName ?? asset.fileName,
      fileName: asset.fileName,
      createdAt: asset.createdAt,
      url: makeAssetUrl(origin, asset.id),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isPrivileged(session.user.role)) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const displayNameRaw = String(formData.get("displayName") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "فایلی ارسال نشده است" }, { status: 400 });
  }
  if (!displayNameRaw) {
    return NextResponse.json({ message: "نام تصویر الزامی است" }, { status: 400 });
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
      displayName: displayNameRaw,
      fileName: file.name,
      mimeType: file.type,
      data: base64,
    },
  });

  const url = makeAssetUrl(new URL(request.url).origin, asset.id);

  return NextResponse.json(
    {
      id: asset.id,
      displayName: asset.displayName,
      fileName: asset.fileName,
      createdAt: asset.createdAt,
      url,
    },
    { status: 201 },
  );
}
