import { NextResponse } from "next/server";
import { getCandidateApiUser } from "@/lib/auth/api-session";
import {
  appendLockdownEvent,
  getSessionById,
  terminateLockdownSession,
  updateIntegrityCounters
} from "@/lib/assessments/lockdown/store";
import { LOCKDOWN_MAX_FOCUS_LOSS, LOCKDOWN_MAX_FULLSCREEN_EXITS } from "@/lib/assessments/lockdown/constants";
import { assertSameOrigin } from "@/lib/security/request";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { lockdownAssessmentEventSchema } from "@/lib/validation/assessment";

async function applyEventToIntegrity(sessionId: string, eventType: string, severity: "info" | "warning" | "critical") {
  return updateIntegrityCounters(sessionId, (integrity) => {
    if (severity !== "info") {
      integrity.warningsCount += 1;
    }
    if (eventType === "FOCUS_LOSS") {
      integrity.focusLossCount += 1;
    }
    if (eventType === "FULLSCREEN_EXIT") {
      integrity.fullscreenExitCount += 1;
    }
    if (eventType === "PASTE_BLOCKED") {
      integrity.pasteAttempts += 1;
    }
    if (eventType === "MULTI_TAB_DETECTED") {
      integrity.multiTabDetected = true;
      integrity.warningsCount += 1;
    }
    if (eventType === "SUSPICIOUS_BURST") {
      integrity.suspiciousBurstDetected = true;
      integrity.warningsCount += 1;
    }
  });
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const candidate = await getCandidateApiUser();
  if (!candidate) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = lockdownAssessmentEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
  }

  const rateLimited = await checkRateLimitDistributed(`assessment-event:${candidate.id}`, 400, 10 * 60 * 1000);
  if (!rateLimited) {
    return NextResponse.json({ error: "Event rate limit exceeded" }, { status: 429 });
  }

  const session = await getSessionById(parsed.data.sessionId);
  if (!session || session.candidateUserId !== candidate.id) {
    return NextResponse.json({ error: "Assessment session not found" }, { status: 404 });
  }
  if (session.deviceId !== parsed.data.deviceId) {
    return NextResponse.json({ error: "Device mismatch for assessment session" }, { status: 403 });
  }

  await appendLockdownEvent({
    sessionId: session.sessionId,
    eventType: parsed.data.eventType,
    detail: parsed.data.detail,
    severity: parsed.data.severity
  });

  const updated = await applyEventToIntegrity(session.sessionId, parsed.data.eventType, parsed.data.severity);
  const current = updated ?? session;

  let terminated = false;
  let terminationReason: string | null = null;

  if (current.integrity.multiTabDetected) {
    terminated = true;
    terminationReason = "Multiple concurrent tabs detected.";
  } else if (current.integrity.fullscreenExitCount >= LOCKDOWN_MAX_FULLSCREEN_EXITS) {
    terminated = true;
    terminationReason = "Fullscreen exited more than allowed threshold.";
  } else if (current.integrity.focusLossCount >= LOCKDOWN_MAX_FOCUS_LOSS) {
    terminated = true;
    terminationReason = "Focus left assessment window beyond allowed threshold.";
  }

  if (terminated && current.status === "active") {
    await terminateLockdownSession(current.sessionId, terminationReason!);
    await appendLockdownEvent({
      sessionId: current.sessionId,
      eventType: "SESSION_TERMINATED",
      detail: terminationReason!,
      severity: "critical"
    });
  }

  return NextResponse.json({
    status: terminated ? "terminated" : current.status,
    integrity: current.integrity,
    terminationReason
  });
}
