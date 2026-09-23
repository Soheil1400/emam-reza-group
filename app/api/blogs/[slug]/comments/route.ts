import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const commentSchema = z.object({
  content: z.string().trim().min(2, "نظر خیلی کوتاه است").max(1000, "نظر بیش از حد طولانی است"),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    select: { id: true, isPublished: true },
  });

  if (!post || !post.isPublished) {
    return NextResponse.json({ comments: [] });
  }

  const comments = await db.comment.findMany({
    where: { postId: post.id },
    include: {
      user: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "برای ثبت نظر باید وارد شوید" }, { status: 401 });
  }

  const { slug } = await context.params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    select: { id: true, isPublished: true },
  });
  if (!post || !post.isPublished) {
    return NextResponse.json({ message: "روایت یافت نشد" }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = commentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "نظر نامعتبر است" },
      { status: 400 },
    );
  }

  const comment = await db.comment.create({
    data: {
      postId: post.id,
      userId: session.user.id,
      content: parsed.data.content,
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
