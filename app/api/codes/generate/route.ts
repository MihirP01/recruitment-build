import { AuditActionType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { generateAccessCode, hashAccessCode } from "@/lib/security/code";
import { applyCors, corsPreflight } from "@/lib/security/cors";
import { validateCsrfToken } from "@/lib/security/csrf";
import { assertSameOrigin } from "@/lib/security/request";
import { writeAuditLog } from "@/lib/services/audit";
import { generateCodeSchema } from "@/lib/validation/codes";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request) || !validateCsrfToken(request.headers.get("x-csrf-token"))) {
    return applyCors(NextResponse.json({ error: "Invalid request" }, { status: 403 }));
  }

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== Role.RECRUITER) {
    return applyCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const recruiterProfile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!recruiterProfile) {
    return applyCors(NextResponse.json({ error: "Recruiter profile missing" }, { status: 400 }));
  }

  const body = await request.json();
  const parsed = generateCodeSchema.safeParse(body);
  if (!parsed.success) {
    return applyCors(NextResponse.json({ error: "Invalid payload" }, { status: 400 }));
  }

  const rawCode = generateAccessCode();
  const codeHash = hashAccessCode(rawCode);
  const expiresAt = new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000);

  const created = await prisma.accessCode.create({
    data: {
      codeHash,
      recruiterId: recruiterProfile.id,
      assignedAssessmentId: parsed.data.assessmentId,
      expiresAt
    }
  });

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: Role.RECRUITER,
    actionType: AuditActionType.ACCESS_CODE_CREATED,
    entityType: "AccessCode",
    entityId: created.id,
    ipAddress,
    userAgent
  });

  return applyCors(
    NextResponse.json({
      id: created.id,
      code: rawCode,
      expiresAt: created.expiresAt.toISOString()
    })
  );
}
