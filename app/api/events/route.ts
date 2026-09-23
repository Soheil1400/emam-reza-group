import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
  const events = await db.event.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ events });
}
