import { AuditActionType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import {
  ASSESSMENT_BINDING_COOKIE,
  createAssessmentBindingToken,
  hashAssessmentFingerprint
} from "@/lib/security/assessment-binding";
import {
  buildAssessmentEnvironmentReasons,
  isMobileLikeUserAgent,
  isVirtualizedGpuRenderer,
  isWebdriverLikeUserAgent
} from "@/lib/security/assessment-environment";
import { assertSameOrigin } from "@/lib/security/request";
import { writeAuditLog } from "@/lib/services/audit";
import { assessmentStartSchema } from "@/lib/validation/assessment";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== Role.CANDIDATE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = assessmentStartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid assessment launch payload" }, { status: 400 });
  }

  const environment = parsed.data.environment;
  const requestUserAgent = request.headers.get("user-agent") ?? "";
  const normalizedChecks = {
    touchDevice: environment.touchDevice || isMobileLikeUserAgent(requestUserAgent),
    smallViewport: environment.smallViewport,
    webdriver: environment.webdriver || isWebdriverLikeUserAgent(requestUserAgent),
    lowCpuCores: environment.lowCpuCores,
    virtualizedGpu: environment.virtualizedGpu || isVirtualizedGpuRenderer(environment.gpuRenderer)
  };
  const restrictionReasons = buildAssessmentEnvironmentReasons(normalizedChecks);

  if (restrictionReasons.length > 0) {
    return NextResponse.json(
      {
        error: "Assessment launch blocked by environment policy",
        restriction: {
          checks: normalizedChecks,
          reasons: restrictionReasons
        }
      },
      { status: 412 }
    );
  }

  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      accessCode: true
    }
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate profile missing" }, { status: 400 });
  }

  const assessmentId = candidate.accessCode?.assignedAssessmentId;
  if (!assessmentId) {
    return NextResponse.json({ error: "No assessment assigned" }, { status: 400 });
  }

  const candidateAssessment = await prisma.candidateAssessment.upsert({
    where: {
      candidateId_assessmentId: {
        candidateId: candidate.id,
        assessmentId
      }
    },
    update: {},
    create: {
      candidateId: candidate.id,
      assessmentId
    },
    include: {
      assessment: {
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              questionText: true,
              options: true,
              orderIndex: true
            }
          }
        }
      }
    }
  });

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const fingerprintHash = hashAssessmentFingerprint(environment.fingerprint);

  await writeAuditLog({
    actorId: session.user.id,
    actorRole: Role.CANDIDATE,
    actionType: AuditActionType.ASSESSMENT_STARTED,
    entityType: "CandidateAssessment",
    entityId: candidateAssessment.id,
    ipAddress,
    userAgent,
    metadata: {
      environment: normalizedChecks,
      viewport: environment.viewport,
      hardwareConcurrency: environment.hardwareConcurrency,
      gpuRenderer: environment.gpuRenderer,
      fingerprintHash
    }
  });

  const bindingToken = createAssessmentBindingToken({
    candidateAssessmentId: candidateAssessment.id,
    userId: session.user.id,
    fingerprintHash,
    issuedAt: Date.now()
  });

  const response = NextResponse.json({
    candidateAssessmentId: candidateAssessment.id,
    assessment: {
      id: candidateAssessment.assessment.id,
      title: candidateAssessment.assessment.title,
      questions: candidateAssessment.assessment.questions
    },
    completedAt: candidateAssessment.completedAt
  });

  response.cookies.set({
    name: ASSESSMENT_BINDING_COOKIE,
    value: bindingToken,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60
  });

  return response;
}
