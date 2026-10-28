import { db } from "@/lib/db";

export const revalidate = 31536000;

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
      // Cache aggressively at the CDN layer to avoid repeated DB reads for media assets.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable",
    },
  });
}
