import { AuditActionType, CandidateStatus, Role } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import {
  ASSESSMENT_BINDING_COOKIE,
  hashAssessmentFingerprint,
  verifyAssessmentBindingToken
} from "@/lib/security/assessment-binding";
import { validateCsrfToken } from "@/lib/security/csrf";
import { assertSameOrigin } from "@/lib/security/request";
import { writeAuditLog } from "@/lib/services/audit";
import { assessmentSubmitSchema } from "@/lib/validation/assessment";

export async function POST(request: Request) {
  if (!assertSameOrigin(request) || !validateCsrfToken(request.headers.get("x-csrf-token"))) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== Role.CANDIDATE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = assessmentSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  if (!candidate) {
    return NextResponse.json({ error: "Candidate profile missing" }, { status: 400 });
  }

  const candidateAssessment = await prisma.candidateAssessment.findUnique({
    where: { id: parsed.data.candidateAssessmentId },
    include: {
      assessment: {
        include: {
          questions: true
        }
      }
    }
  });

  if (!candidateAssessment || candidateAssessment.candidateId !== candidate.id) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const bindingToken = cookies().get(ASSESSMENT_BINDING_COOKIE)?.value;
  if (bindingToken) {
    const binding = verifyAssessmentBindingToken(bindingToken);
    const fingerprintHeader = request.headers.get("x-assessment-fingerprint");
    const fingerprintHash = fingerprintHeader ? hashAssessmentFingerprint(fingerprintHeader) : null;

    if (
      !binding ||
      !fingerprintHash ||
      binding.userId !== session.user.id ||
      binding.candidateAssessmentId !== candidateAssessment.id ||
      binding.fingerprintHash !== fingerprintHash
    ) {
      return NextResponse.json({ error: "Assessment session binding mismatch" }, { status: 403 });
    }
  }

  if (candidateAssessment.completedAt) {
    return NextResponse.json({ error: "Assessment already submitted" }, { status: 409 });
  }

  const questionMap = new Map(candidateAssessment.assessment.questions.map((q) => [q.id, q]));
  const answers = parsed.data.answers;

  for (const answer of answers) {
    if (!questionMap.has(answer.questionId)) {
      return NextResponse.json({ error: "Invalid question in submission" }, { status: 400 });
    }
  }

  let score = 0;
  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (question && question.correctAnswer === answer.selectedAnswer) {
      score += 1;
    }
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  await prisma.$transaction(async (tx) => {
    await tx.candidateAnswer.createMany({
      data: answers.map((answer) => ({
        candidateAssessmentId: candidateAssessment.id,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer
      }))
    });

    await tx.candidateAssessment.update({
      where: { id: candidateAssessment.id },
      data: {
        score,
        completedAt: new Date(),
        submissionIp: ipAddress
      }
    });

    await tx.candidateProfile.update({
      where: { id: candidate.id },
      data: {
        status: CandidateStatus.COMPLETED
      }
    });
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: Role.CANDIDATE,
    actionType: AuditActionType.ASSESSMENT_SUBMITTED,
    entityType: "CandidateAssessment",
    entityId: candidateAssessment.id,
    ipAddress,
    userAgent,
    metadata: { score }
  });

  const response = NextResponse.json({ success: true, score });
  response.cookies.set({
    name: ASSESSMENT_BINDING_COOKIE,
    value: "",
    path: "/",
    maxAge: 0
  });
  return response;
}
