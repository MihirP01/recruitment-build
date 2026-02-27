import { AuditActionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashAccessCode } from "@/lib/security/code";
import { applyCors, corsPreflight } from "@/lib/security/cors";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { writeAuditLog } from "@/lib/services/audit";
import { validateCodeSchema } from "@/lib/validation/codes";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  if (!(await checkRateLimitDistributed(`code-validate:${ipAddress}`, 12, 10 * 60 * 1000))) {
    return applyCors(NextResponse.json({ valid: false, error: "Too many attempts" }, { status: 429 }));
  }

  const body = await request.json();
  const parsed = validateCodeSchema.safeParse(body);
  if (!parsed.success) {
    return applyCors(NextResponse.json({ valid: false }, { status: 400 }));
  }

  const codeHash = hashAccessCode(parsed.data.code.toUpperCase());

  const accessCode = await prisma.accessCode.findUnique({ where: { codeHash } });
  const valid = !!accessCode && !accessCode.isUsed && accessCode.expiresAt > new Date();

  await writeAuditLog({
    actionType: AuditActionType.ACCESS_CODE_VALIDATED,
    entityType: "AccessCode",
    entityId: accessCode?.id,
    ipAddress,
    userAgent,
    metadata: { valid }
  });

  return applyCors(NextResponse.json({ valid }));
}
