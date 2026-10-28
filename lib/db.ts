import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  return new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
    ssl: connectionString?.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  });
}

const pool = globalForPrisma.pgPool ?? createPool();
const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.pgPool = pool;
globalForPrisma.prisma = db;

export function isDatabaseSaturationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("too many connections") ||
    message.includes("Can't reach database server") ||
    message.includes("Connection terminated") ||
    message.includes("timeout exceeded when trying to connect")
  );
}

export async function withDbRetry<T>(operation: () => Promise<T>, attempts = 4): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isDatabaseSaturationError(error) || attempt === attempts - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }
  throw lastError;
}
