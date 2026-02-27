import { AuditActionType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashAccessCode } from "@/lib/security/code";
import { validateCsrfToken } from "@/lib/security/csrf";
import { encryptPii } from "@/lib/security/encryption";
import { assertSameOrigin } from "@/lib/security/request";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { writeAuditLog } from "@/lib/services/audit";
import { hashPassword, validatePasswordPolicy } from "@/lib/security/password";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  if (!assertSameOrigin(request) || !validateCsrfToken(request.headers.get("x-csrf-token"))) {
    return NextResponse.json({ error: "Invalid request origin or CSRF token" }, { status: 403 });
  }

  if (!(await checkRateLimitDistributed(`register:${ipAddress}`, 8, 15 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many registration attempts" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { code, email, password, fullName } = parsed.data;

  if (!validatePasswordPolicy(password)) {
    return NextResponse.json({ error: "Password does not meet policy" }, { status: 400 });
  }

  const codeHash = hashAccessCode(code.toUpperCase());

  const accessCode = await prisma.accessCode.findUnique({
    where: { codeHash },
    include: {
      assignedAssessment: true
    }
  });

  if (!accessCode || accessCode.isUsed || accessCode.expiresAt <= new Date()) {
    await writeAuditLog({
      actionType: AuditActionType.ACCESS_CODE_VALIDATED,
      entityType: "AccessCode",
      ipAddress,
      userAgent,
      metadata: { valid: false }
    });
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  let encryptedFullName: string;
  try {
    encryptedFullName = encryptPii(fullName);
  } catch {
    return NextResponse.json(
      { error: "Registration is temporarily unavailable due to secure data encryption configuration." },
      { status: 503 }
    );
  }

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: Role.CANDIDATE
      }
    });

    const candidateProfile = await tx.candidateProfile.create({
      data: {
        userId: user.id,
        recruiterId: accessCode.recruiterId,
        fullName: encryptedFullName
      }
    });

    await tx.accessCode.update({
      where: { id: accessCode.id },
      data: {
        isUsed: true,
        candidateId: candidateProfile.id
      }
    });

    if (accessCode.assignedAssessmentId) {
      await tx.candidateAssessment.upsert({
        where: {
          candidateId_assessmentId: {
            candidateId: candidateProfile.id,
            assessmentId: accessCode.assignedAssessmentId
          }
        },
        update: {},
        create: {
          candidateId: candidateProfile.id,
          assessmentId: accessCode.assignedAssessmentId
        }
      });
    }

    return { user, candidateProfile };
  });

  await writeAuditLog({
    actorId: created.user.id,
    actorRole: Role.CANDIDATE,
    actionType: AuditActionType.CANDIDATE_REGISTERED,
    entityType: "CandidateProfile",
    entityId: created.candidateProfile.id,
    ipAddress,
    userAgent
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
