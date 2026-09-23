import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const asset = await db.mediaAsset.findUnique({ where: { id } });

  if (!asset) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = Buffer.from(asset.data, "base64");
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": asset.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
