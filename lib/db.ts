import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildPrismaDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return undefined;

  if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    return databaseUrl;
  }

  try {
    const url = new URL(databaseUrl);
    if (!url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "20");
    }
    return url.toString();
  } catch {
    return databaseUrl;
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildPrismaDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
