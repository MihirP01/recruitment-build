import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/security/rate-limit";

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function checkRateLimitDistributedInternal(
  key: string,
  limit: number,
  windowMs: number,
  attempt: number
): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.rateLimitBucket.updateMany({
        where: {
          bucketKey: key,
          resetAt: {
            lte: now
          }
        },
        data: {
          count: 0,
          resetAt
        }
      });

      const incrementResult = await tx.rateLimitBucket.updateMany({
        where: {
          bucketKey: key,
          count: {
            lt: limit
          }
        },
        data: {
          count: {
            increment: 1
          }
        }
      });

      if (incrementResult.count > 0) {
        return true;
      }

      const existing = await tx.rateLimitBucket.findUnique({
        where: { bucketKey: key },
        select: { id: true }
      });

      if (existing) {
        return false;
      }

      await tx.rateLimitBucket.create({
        data: {
          bucketKey: key,
          count: 1,
          resetAt
        }
      });
      return true;
    });
  } catch (error) {
    if (attempt < 1 && isUniqueViolation(error)) {
      return checkRateLimitDistributedInternal(key, limit, windowMs, attempt + 1);
    }
    throw error;
  }
}

export async function checkRateLimitDistributed(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    return await checkRateLimitDistributedInternal(key, limit, windowMs, 0);
  } catch {
    // Fallback keeps handlers available if DB is temporarily unavailable.
    return checkRateLimit(key, limit, windowMs);
  }
}
