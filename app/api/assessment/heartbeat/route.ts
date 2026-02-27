import { NextResponse } from "next/server";
import { getCandidateApiUser } from "@/lib/auth/api-session";
import { appendLockdownEvent, getLockdownSessionEvents, getSessionById, touchLockdownSession } from "@/lib/assessments/lockdown/store";
import { assertSameOrigin } from "@/lib/security/request";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { lockdownAssessmentHeartbeatSchema } from "@/lib/validation/assessment";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const candidate = await getCandidateApiUser();
  if (!candidate) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = lockdownAssessmentHeartbeatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid heartbeat payload" }, { status: 400 });
  }

  const rateLimited = await checkRateLimitDistributed(`assessment-heartbeat:${candidate.id}`, 240, 10 * 60 * 1000);
  if (!rateLimited) {
    return NextResponse.json({ error: "Heartbeat rate limit exceeded" }, { status: 429 });
  }

  const session = await getSessionById(parsed.data.sessionId);
  if (!session || session.candidateUserId !== candidate.id) {
    return NextResponse.json({ error: "Assessment session not found" }, { status: 404 });
  }
  if (session.deviceId !== parsed.data.deviceId) {
    return NextResponse.json({ error: "Device mismatch for assessment session" }, { status: 403 });
  }

  await touchLockdownSession(session.sessionId);
  await appendLockdownEvent({
    sessionId: session.sessionId,
    eventType: "HEARTBEAT",
    detail: `Heartbeat received (t=${parsed.data.timerRemainingSec ?? "n/a"}).`,
    severity: "info"
  });

  const events = await getLockdownSessionEvents(session.sessionId);
  const refreshedSession = await getSessionById(session.sessionId);
  if (!refreshedSession) {
    return NextResponse.json({ error: "Assessment session not found" }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: refreshedSession.sessionId,
    status: refreshedSession.status,
    terminationReason: refreshedSession.terminationReason,
    prompt: {
      id: refreshedSession.prompt.id,
      text: refreshedSession.prompt.text
    },
    integrity: refreshedSession.integrity,
    startedAt: refreshedSession.startedAt,
    completedAt: refreshedSession.completedAt,
    eventsCount: events.length
  });
}
