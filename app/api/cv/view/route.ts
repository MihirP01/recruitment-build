import { AuditActionType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { validateCsrfToken } from "@/lib/security/csrf";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { assertSameOrigin } from "@/lib/security/request";
import { getCvSignedUrl } from "@/lib/security/s3";
import { writeAuditLog } from "@/lib/services/audit";
import { cvViewSchema } from "@/lib/validation/cv";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  if (!assertSameOrigin(request) || !validateCsrfToken(request.headers.get("x-csrf-token"))) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== Role.RECRUITER && session.user.role !== Role.CLIENT)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await checkRateLimitDistributed(`cv-view:${session.user.id}:${ipAddress}`, 60, 15 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = cvViewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: parsed.data.candidateId },
    select: {
      id: true,
      recruiterId: true,
      sharedWithClientId: true,
      cvStorageKey: true,
      cvUrl: true,
      recruiter: {
        select: {
          userId: true
        }
      }
    }
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (session.user.role === Role.RECRUITER) {
    if (candidate.recruiter.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (session.user.role === Role.CLIENT) {
    if (candidate.sharedWithClientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const storageKey = candidate.cvStorageKey ?? candidate.cvUrl;
  if (!storageKey) {
    return NextResponse.json({ error: "CV not uploaded" }, { status: 404 });
  }

  let signedUrl: string;
  try {
    signedUrl = await getCvSignedUrl(storageKey, 60);
  } catch {
    return NextResponse.json({ error: "Unable to generate CV link" }, { status: 500 });
  }

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    actionType: AuditActionType.CV_VIEW_SIGNED_URL_ISSUED,
    entityType: "CandidateProfile",
    entityId: candidate.id,
    ipAddress,
    userAgent
  });

  return NextResponse.json({ url: signedUrl, expiresIn: 60 });
}
