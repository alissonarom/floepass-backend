import { PrismaClient } from "@prisma/client";

// Singleton Prisma client to be reused across the app
export const prisma = new PrismaClient();

export async function ensureDbConnection(): Promise<void> {
  // Simple connectivity check
  await prisma.$queryRaw`SELECT 1`;
}
