import { db, withDbRetry } from "@/lib/db";

export const revalidate = 31536000;

type CachedMedia = {
  mimeType: string;
  body: ArrayBuffer;
  cachedAt: number;
};

const MEDIA_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MEDIA_CACHE_MAX_ITEMS = 300;

const globalMediaCache = globalThis as unknown as {
  mediaAssetCache?: Map<string, CachedMedia>;
};

const mediaAssetCache = globalMediaCache.mediaAssetCache ?? new Map<string, CachedMedia>();
globalMediaCache.mediaAssetCache = mediaAssetCache;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const now = Date.now();
  const cached = mediaAssetCache.get(id);

  if (cached && now - cached.cachedAt < MEDIA_CACHE_TTL_MS) {
    return new Response(cached.body, {
      status: 200,
      headers: {
        "Content-Type": cached.mimeType,
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable",
      },
    });
  }

  const asset = await withDbRetry(() => db.mediaAsset.findUnique({ where: { id } }));

  if (!asset) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = Uint8Array.from(Buffer.from(asset.data, "base64"));
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  mediaAssetCache.set(id, {
    mimeType: asset.mimeType,
    body,
    cachedAt: now,
  });

  if (mediaAssetCache.size > MEDIA_CACHE_MAX_ITEMS) {
    const oldestKey = mediaAssetCache.keys().next().value;
    if (oldestKey) {
      mediaAssetCache.delete(oldestKey);
    }
  }

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": asset.mimeType,
      // Cache aggressively at the CDN layer to avoid repeated DB reads for media assets.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable",
    },
  });
}
