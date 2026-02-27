import { AuditActionType, CandidateStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { validateCsrfToken } from "@/lib/security/csrf";
import { assertSameOrigin } from "@/lib/security/request";
import { writeAuditLog } from "@/lib/services/audit";
import { shareCandidateSchema } from "@/lib/validation/recruiter/share";

export async function POST(request: Request) {
  if (!assertSameOrigin(request) || !validateCsrfToken(request.headers.get("x-csrf-token"))) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.RECRUITER) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: session.user.id } });
  if (!recruiterProfile) {
    return NextResponse.json({ error: "Recruiter profile missing" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = shareCandidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const candidate = await prisma.candidateProfile.findUnique({ where: { id: parsed.data.candidateId } });
  if (!candidate || candidate.recruiterId !== recruiterProfile.id) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const clientUser = await prisma.user.findUnique({ where: { id: parsed.data.clientUserId } });
  if (!clientUser || clientUser.role !== Role.CLIENT) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const updated = await prisma.candidateProfile.update({
    where: { id: candidate.id },
    data: {
      sharedWithClientId: clientUser.id,
      recruiterNotes: parsed.data.recruiterNotes,
      status: CandidateStatus.SHARED
    }
  });

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: Role.RECRUITER,
    actionType: AuditActionType.CANDIDATE_SHARED_TO_CLIENT,
    entityType: "CandidateProfile",
    entityId: updated.id,
    ipAddress,
    userAgent,
    metadata: { clientUserId: parsed.data.clientUserId }
  });

  return NextResponse.json({ success: true });
}
