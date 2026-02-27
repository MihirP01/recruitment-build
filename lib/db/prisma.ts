import { PrismaClient } from "@prisma/client";
import { IS_DEV } from "@/lib/env/isDev";

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
      throw new Error("Prisma is disabled in CTRL dev-suite mode.");
    }
  };

  return new Proxy({}, handler) as PrismaClient;
}

const prismaClient = IS_DEV ? undefined : (global.prisma ?? createPrismaClient());

if (!IS_DEV && process.env.NODE_ENV !== "production") {
  global.prisma = prismaClient;
}

export const prisma: PrismaClient = prismaClient ?? createDisabledPrismaClient();
