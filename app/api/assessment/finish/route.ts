import { NextResponse } from "next/server";
import { getCandidateApiUser } from "@/lib/auth/api-session";
import {
  appendLockdownEvent,
  completeLockdownSession,
  getLockdownSessionEvents,
  getSessionById,
  terminateLockdownSession
} from "@/lib/assessments/lockdown/store";
import { assertSameOrigin } from "@/lib/security/request";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { lockdownAssessmentFinishSchema } from "@/lib/validation/assessment";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const candidate = await getCandidateApiUser();
  if (!candidate) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await checkRateLimitDistributed(`assessment-finish:${candidate.id}`, 40, 10 * 60 * 1000);
  if (!rateLimited) {
    return NextResponse.json({ error: "Too many submission attempts." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = lockdownAssessmentFinishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid finish payload" }, { status: 400 });
  }

  const session = await getSessionById(parsed.data.sessionId);
  if (!session || session.candidateUserId !== candidate.id) {
    return NextResponse.json({ error: "Assessment session not found" }, { status: 404 });
  }
  if (session.deviceId !== parsed.data.deviceId) {
    return NextResponse.json({ error: "Device mismatch for assessment session" }, { status: 403 });
  }

  if (session.status !== "active") {
    return NextResponse.json(
      {
        error: "Assessment session is not active.",
        status: session.status,
        terminationReason: session.terminationReason
      },
      { status: 409 }
    );
  }

  if (parsed.data.status === "terminated") {
    const reason = parsed.data.terminationReason ?? "Session ended by integrity policy.";
    await terminateLockdownSession(session.sessionId, reason);
    await appendLockdownEvent({
      sessionId: session.sessionId,
      eventType: "SESSION_TERMINATED",
      detail: reason,
      severity: "critical"
    });
    return NextResponse.json({
      status: "terminated",
      terminationReason: reason
    });
  }

  if (!parsed.data.result) {
    return NextResponse.json({ error: "Assessment result payload required for completion." }, { status: 400 });
  }

  const completedSession = await completeLockdownSession(session.sessionId, parsed.data.result);
  await appendLockdownEvent({
    sessionId: session.sessionId,
    eventType: "ASSESSMENT_SUBMIT",
    detail: "Assessment submitted and marked for recruiter review.",
    severity: "info"
  });

  const events = await getLockdownSessionEvents(session.sessionId);

  return NextResponse.json({
    status: "completed",
    completedAt: completedSession?.completedAt ?? new Date().toISOString(),
    reviewStatus: "Submitted for review",
    eventsCount: events.length
  });
}
