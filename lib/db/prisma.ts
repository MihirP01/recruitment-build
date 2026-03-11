import { PrismaClient } from "@prisma/client";
import { HAS_DATABASE } from "@/lib/env/database";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });
}

function createDisabledPrismaClient(): PrismaClient {
  const handler: ProxyHandler<object> = {
    get() {
      throw new Error("Prisma is unavailable because DATABASE_URL is not configured.");
    }
  };

  return new Proxy({}, handler) as PrismaClient;
}

const prismaClient = HAS_DATABASE ? (global.prisma ?? createPrismaClient()) : undefined;

if (HAS_DATABASE && process.env.NODE_ENV !== "production") {
  global.prisma = prismaClient;
}

export const prisma: PrismaClient = prismaClient ?? createDisabledPrismaClient();
