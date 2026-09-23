import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogSchema } from "@/lib/validations";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return (
    session?.user.role === "ADMIN" ||
    session?.user.role === "SUB_ADMIN" ||
    session?.user.role === "COMMANDER" ||
    session?.user.role === "CIRCLE_LEAD"
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = blogSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "داده نامعتبر است" },
      { status: 400 },
    );
  }

  const { sections, ...postData } = parsed.data;

  const post = await db.blogPost.create({
    data: {
      ...postData,
      authorId: session.user.id,
      publishedAt: postData.isPublished ? new Date() : null,
      sections: {
        create: sections.map((section, index) => ({
          type: section.type,
          sortOrder: index,
          content: {
            title: section.title,
            text: section.text,
            imageUrl: section.imageUrl ?? null,
          },
        })),
      },
    },
  });

  return NextResponse.json({ id: post.id }, { status: 201 });
}
