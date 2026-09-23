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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await context.params;
  const payload = await request.json();
  const parsed = blogSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "داده نامعتبر است" },
      { status: 400 },
    );
  }

  const { sections, ...postData } = parsed.data;

  await db.$transaction([
    db.blogSection.deleteMany({ where: { postId: id } }),
    db.blogPost.update({
      where: { id },
      data: {
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
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
    }),
  ]);

  return NextResponse.json({ message: "روایت بروزرسانی شد" });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await context.params;
  await db.blogPost.delete({ where: { id } });
  return NextResponse.json({ message: "روایت حذف شد" });
}
