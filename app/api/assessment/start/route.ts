import { NextResponse } from "next/server";
import { getCandidateApiUser } from "@/lib/auth/api-session";
import { getAssessmentById } from "@/lib/data";
import { appendLockdownEvent, createLockdownSession } from "@/lib/assessments/lockdown/store";
import {
  evaluateAssessmentEnvironment,
  isMobileLikeUserAgent,
  isVirtualizedGpuRenderer,
  isWebdriverLikeUserAgent
} from "@/lib/security/assessment-environment";
import { assertSameOrigin } from "@/lib/security/request";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { lockdownAssessmentStartSchema } from "@/lib/validation/assessment";

const WPM_DURATION_SEC = 60;

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const candidate = await getCandidateApiUser();
  if (!candidate) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await checkRateLimitDistributed(`assessment-start:${candidate.id}`, 12, 10 * 60 * 1000);
  if (!rateLimited) {
    return NextResponse.json({ error: "Too many launch attempts. Please wait and retry." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = lockdownAssessmentStartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid assessment start payload" }, { status: 400 });
  }

  const assessment = await getAssessmentById(parsed.data.assessmentId);
  if (!assessment || (assessment.actionLabel !== "Start Assessment" && assessment.actionLabel !== "Resume")) {
    return NextResponse.json({ error: "Assessment is not available for launch" }, { status: 404 });
  }

  if (!parsed.data.acknowledged) {
    return NextResponse.json({ error: "Candidate acknowledgement is required before secure mode." }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const normalizedEnvironment = {
    ...parsed.data.environment,
    mobileUserAgent: parsed.data.environment.mobileUserAgent || isMobileLikeUserAgent(userAgent),
    webdriver: parsed.data.environment.webdriver || isWebdriverLikeUserAgent(userAgent),
    virtualizedGpu:
      parsed.data.environment.virtualizedGpu || isVirtualizedGpuRenderer(parsed.data.environment.gpuRenderer)
  };

  const policy = evaluateAssessmentEnvironment(normalizedEnvironment);
  if (policy.blockingReasons.length > 0) {
    return NextResponse.json(
      {
        error: "Assessment launch blocked by secure environment policy.",
        restriction: {
          reasons: policy.blockingReasons,
          warnings: policy.warnings
        }
      },
      { status: 412 }
    );
  }

  const session = await createLockdownSession({
    candidateUserId: candidate.id,
    assessmentId: assessment.id,
    assessmentName: assessment.name,
    deviceId: parsed.data.deviceId
  });

  await appendLockdownEvent({
    sessionId: session.sessionId,
    eventType: "SESSION_STARTED",
    detail: `Secure session started for ${assessment.name}.`,
    severity: "info"
  });

  if (normalizedEnvironment.webdriver) {
    await appendLockdownEvent({
      sessionId: session.sessionId,
      eventType: "AUTOMATION_FLAG",
      detail: "Automation runtime flag detected during start preflight.",
      severity: "warning"
    });
  }

  return NextResponse.json({
    sessionId: session.sessionId,
    assessment: {
      id: assessment.id,
      name: assessment.name,
      promptId: session.prompt.id,
      promptText: session.prompt.text,
      durationSec: WPM_DURATION_SEC
    },
    startedAt: session.startedAt,
    policyWarnings: policy.warnings
  });
}
