import { randomUUID } from "crypto";
import { AuditActionType, Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { appendDevAuditLog, getDevAuditLogs } from "@/lib/dev/auditLogStore";
import { IS_DEV } from "@/lib/env/isDev";

type AuditInput = {
  actorId?: string;
  actorRole?: Role;
  actionType: AuditActionType;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
};

export async function writeAuditLog(input: AuditInput): Promise<void> {
  if (IS_DEV) {
    await appendDevAuditLog({
      id: randomUUID(),
      actorId: input.actorId ?? null,
      actorRole: input.actorRole ?? null,
      actionType: input.actionType,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: (input.metadata as Prisma.JsonValue | undefined) ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorRole: input.actorRole,
        actionType: input.actionType,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent
      }
    });
  } catch {
    if (process.env.NODE_ENV === "development") {
      return;
    }
    throw new Error("Failed to persist audit log.");
  }
}

export async function listAuditLogs(limit = 100) {
  if (IS_DEV) {
    return getDevAuditLogs(limit);
  }

  return prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: limit
  });
}
