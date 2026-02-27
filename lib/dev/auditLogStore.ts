import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { AuditActionType, Prisma, Role } from "@prisma/client";

const DEV_DATA_DIR = path.join(process.cwd(), "dev-data");
const DEV_AUDIT_FILE = path.join(DEV_DATA_DIR, "audit-log.ndjson");

export type DevAuditLogRecord = {
  id: string;
  actorId: string | null;
  actorRole: Role | null;
  actionType: AuditActionType;
  entityType: string;
  entityId: string | null;
  metadata: Prisma.JsonValue | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
};

function isRecord(value: unknown): value is DevAuditLogRecord {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<DevAuditLogRecord>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.actionType === "string" &&
    typeof candidate.entityType === "string" &&
    typeof candidate.timestamp === "string"
  );
}

export async function appendDevAuditLog(record: DevAuditLogRecord): Promise<void> {
  await fs.mkdir(DEV_DATA_DIR, { recursive: true });
  const line = `${JSON.stringify(record)}\n`;
  await fs.appendFile(DEV_AUDIT_FILE, line, "utf8");
}

export async function getDevAuditLogs(limit = 100): Promise<DevAuditLogRecord[]> {
  try {
    const content = await fs.readFile(DEV_AUDIT_FILE, "utf8");
    const logs = content
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as unknown;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is DevAuditLogRecord => isRecord(entry))
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

    return logs.slice(0, limit);
  } catch {
    return [];
  }
}

