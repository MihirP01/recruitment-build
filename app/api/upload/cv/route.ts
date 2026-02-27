import { AuditActionType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { validateCsrfToken } from "@/lib/security/csrf";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { assertSameOrigin } from "@/lib/security/request";
import { uploadCandidateCv } from "@/lib/security/s3";
import { writeAuditLog } from "@/lib/services/audit";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  if (!assertSameOrigin(request) || !validateCsrfToken(request.headers.get("x-csrf-token"))) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.CANDIDATE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await checkRateLimitDistributed(`cv-upload:${session.user.id}:${ipAddress}`, 8, 15 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many upload attempts" }, { status: 429 });
  }

  const formData = await request.formData();
  const cvFile = formData.get("cvFile");

  if (!(cvFile instanceof File)) {
    return NextResponse.json({ error: "CV file is required" }, { status: 400 });
  }

  if (cvFile.size === 0 || cvFile.size > MAX_CV_SIZE_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 5MB" }, { status: 400 });
  }

  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true }
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate profile missing" }, { status: 404 });
  }

  let storageKey: string;
  try {
    const fileBuffer = Buffer.from(await cvFile.arrayBuffer());
    storageKey = await uploadCandidateCv({
      candidateId: candidate.id,
      fileName: cvFile.name,
      mimeType: cvFile.type,
      body: fileBuffer
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unsupported file type")) {
      return NextResponse.json({ error: "Allowed formats: PDF, DOC, DOCX" }, { status: 400 });
    }
    return NextResponse.json({ error: "CV upload failed" }, { status: 500 });
  }

  await prisma.candidateProfile.update({
    where: { id: candidate.id },
    data: {
      cvStorageKey: storageKey,
      cvUrl: storageKey
    }
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: Role.CANDIDATE,
    actionType: AuditActionType.CV_UPLOADED,
    entityType: "CandidateProfile",
    entityId: candidate.id,
    ipAddress,
    userAgent,
    metadata: {
      fileName: cvFile.name,
      fileSize: cvFile.size,
      mimeType: cvFile.type
    }
  });

  return NextResponse.json({ success: true });
}
