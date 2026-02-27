import { randomUUID } from "crypto";
import { WpmPrompt, selectRandomPrompt } from "@/lib/assessments/wpm/prompts";
import { LOCKDOWN_HEARTBEAT_MAX_AGE_MS } from "@/lib/assessments/lockdown/constants";
import { prisma } from "@/lib/db/prisma";
import { IS_DEV } from "@/lib/env/isDev";

export type LockdownEventType =
  | "SESSION_STARTED"
  | "HEARTBEAT"
  | "FOCUS_LOSS"
  | "FOCUS_REGAINED"
  | "FULLSCREEN_EXIT"
  | "FULLSCREEN_ENTER"
  | "PASTE_BLOCKED"
  | "COPY_ATTEMPT"
  | "CUT_ATTEMPT"
  | "KEYBOARD_EVENT"
  | "MULTI_TAB_DETECTED"
  | "SUSPICIOUS_BURST"
  | "EXIT_ATTEMPT"
  | "ASSESSMENT_SUBMIT"
  | "SESSION_TERMINATED"
  | "AUTOMATION_FLAG";

export type LockdownEventSeverity = "info" | "warning" | "critical";

export type LockdownAuditEvent = {
  id: string;
  sessionId: string;
  at: string;
  eventType: LockdownEventType;
  detail: string;
  severity: LockdownEventSeverity;
};

export type LockdownSessionStatus = "active" | "completed" | "terminated";

export type LockdownIntegrityState = {
  focusLossCount: number;
  fullscreenExitCount: number;
  pasteAttempts: number;
  warningsCount: number;
  multiTabDetected: boolean;
  suspiciousBurstDetected: boolean;
};

export type LockdownResult = {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  errors: number;
  charactersTyped: number;
  backspaces: number;
  cadence: {
    averageIntervalMs: number;
    stdDevIntervalMs: number;
    samples: number;
  };
  integrity: {
    score: number;
    focusLossCount: number;
    fullscreenExitCount: number;
    pasteAttempts: number;
    multiTabDetected: boolean;
    suspiciousBurstDetected: boolean;
    warningsCount: number;
  };
};

export type LockdownSession = {
  sessionId: string;
  candidateUserId: string;
  assessmentId: string;
  assessmentName: string;
  deviceId: string;
  startedAt: string;
  completedAt: string | null;
  lastHeartbeatAt: string;
  prompt: WpmPrompt;
  status: LockdownSessionStatus;
  terminationReason: string | null;
  integrity: LockdownIntegrityState;
  result: LockdownResult | null;
};

type MemoryStore = {
  sessions: Map<string, LockdownSession>;
  events: Map<string, LockdownAuditEvent[]>;
};

const memoryRoot = globalThis as typeof globalThis & { __ctrlLockdownStore?: MemoryStore };
if (!memoryRoot.__ctrlLockdownStore) {
  memoryRoot.__ctrlLockdownStore = {
    sessions: new Map<string, LockdownSession>(),
    events: new Map<string, LockdownAuditEvent[]>()
  };
}

function getMemoryStore() {
  return memoryRoot.__ctrlLockdownStore!;
}

const DEV_MEMORY_FALLBACK = IS_DEV || process.env.NODE_ENV !== "production";

function shouldUseMemoryOnly() {
  return IS_DEV || !process.env.DATABASE_URL;
}

function rethrowLockdownStoreError(error: unknown): never {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error("Lockdown store operation failed.");
}

function defaultIntegrityState(): LockdownIntegrityState {
  return {
    focusLossCount: 0,
    fullscreenExitCount: 0,
    pasteAttempts: 0,
    warningsCount: 0,
    multiTabDetected: false,
    suspiciousBurstDetected: false
  };
}

function parseStatus(status: string): LockdownSessionStatus {
  if (status === "completed" || status === "terminated") {
    return status;
  }
  return "active";
}

function parseIntegrityState(value: unknown): LockdownIntegrityState {
  if (!value || typeof value !== "object") {
    return defaultIntegrityState();
  }
  const integrity = value as Partial<LockdownIntegrityState>;
  return {
    focusLossCount: Number.isFinite(integrity.focusLossCount) ? Number(integrity.focusLossCount) : 0,
    fullscreenExitCount: Number.isFinite(integrity.fullscreenExitCount) ? Number(integrity.fullscreenExitCount) : 0,
    pasteAttempts: Number.isFinite(integrity.pasteAttempts) ? Number(integrity.pasteAttempts) : 0,
    warningsCount: Number.isFinite(integrity.warningsCount) ? Number(integrity.warningsCount) : 0,
    multiTabDetected: Boolean(integrity.multiTabDetected),
    suspiciousBurstDetected: Boolean(integrity.suspiciousBurstDetected)
  };
}

function parseLockdownResult(value: unknown): LockdownResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as LockdownResult;
}

function toLockdownSession(record: {
  id: string;
  candidateUserId: string;
  assessmentId: string;
  assessmentName: string;
  deviceId: string;
  startedAt: Date;
  completedAt: Date | null;
  lastHeartbeatAt: Date;
  promptId: string;
  promptText: string;
  status: string;
  terminationReason: string | null;
  integrity: unknown;
  result: unknown;
}): LockdownSession {
  return {
    sessionId: record.id,
    candidateUserId: record.candidateUserId,
    assessmentId: record.assessmentId,
    assessmentName: record.assessmentName,
    deviceId: record.deviceId,
    startedAt: record.startedAt.toISOString(),
    completedAt: record.completedAt?.toISOString() ?? null,
    lastHeartbeatAt: record.lastHeartbeatAt.toISOString(),
    prompt: {
      id: record.promptId,
      text: record.promptText
    },
    status: parseStatus(record.status),
    terminationReason: record.terminationReason,
    integrity: parseIntegrityState(record.integrity),
    result: parseLockdownResult(record.result)
  };
}

function createMemorySession(input: {
  candidateUserId: string;
  assessmentId: string;
  assessmentName: string;
  deviceId: string;
}): LockdownSession {
  const prompt = selectRandomPrompt(Date.now());
  const now = new Date().toISOString();
  const session: LockdownSession = {
    sessionId: randomUUID(),
    candidateUserId: input.candidateUserId,
    assessmentId: input.assessmentId,
    assessmentName: input.assessmentName,
    deviceId: input.deviceId,
    startedAt: now,
    completedAt: null,
    lastHeartbeatAt: now,
    prompt,
    status: "active",
    terminationReason: null,
    integrity: defaultIntegrityState(),
    result: null
  };

  const state = getMemoryStore();
  state.sessions.set(session.sessionId, session);
  state.events.set(session.sessionId, []);
  return session;
}

function appendMemoryEvent(input: {
  sessionId: string;
  eventType: LockdownEventType;
  detail: string;
  severity: LockdownEventSeverity;
}): LockdownAuditEvent {
  const state = getMemoryStore();
  const events = state.events.get(input.sessionId) ?? [];
  const event: LockdownAuditEvent = {
    id: randomUUID(),
    sessionId: input.sessionId,
    at: new Date().toISOString(),
    eventType: input.eventType,
    detail: input.detail,
    severity: input.severity
  };
  events.push(event);
  state.events.set(input.sessionId, events.slice(-300));
  return event;
}

function memorySessionById(sessionId: string) {
  return getMemoryStore().sessions.get(sessionId) ?? null;
}

function memoryEventsById(sessionId: string) {
  return getMemoryStore().events.get(sessionId) ?? [];
}

export async function getSessionById(sessionId: string): Promise<LockdownSession | null> {
  if (shouldUseMemoryOnly()) {
    return memorySessionById(sessionId);
  }

  try {
    const session = await prisma.lockdownSession.findUnique({
      where: { id: sessionId }
    });
    if (!session) {
      return memorySessionById(sessionId);
    }
    return toLockdownSession(session);
  } catch (error) {
    if (!DEV_MEMORY_FALLBACK) {
      rethrowLockdownStoreError(error);
    }
    return memorySessionById(sessionId);
  }
}

export async function createLockdownSession(input: {
  candidateUserId: string;
  assessmentId: string;
  assessmentName: string;
  deviceId: string;
}): Promise<LockdownSession> {
  if (shouldUseMemoryOnly()) {
    return createMemorySession(input);
  }

  const prompt = selectRandomPrompt(Date.now());
  const integrity = defaultIntegrityState();

  try {
    const created = await prisma.lockdownSession.create({
      data: {
        candidateUserId: input.candidateUserId,
        assessmentId: input.assessmentId,
        assessmentName: input.assessmentName,
        deviceId: input.deviceId,
        promptId: prompt.id,
        promptText: prompt.text,
        status: "active",
        integrity
      }
    });
    return toLockdownSession(created);
  } catch (error) {
    if (!DEV_MEMORY_FALLBACK) {
      rethrowLockdownStoreError(error);
    }
    return createMemorySession(input);
  }
}

export async function appendLockdownEvent(input: {
  sessionId: string;
  eventType: LockdownEventType;
  detail: string;
  severity: LockdownEventSeverity;
}): Promise<LockdownAuditEvent> {
  if (shouldUseMemoryOnly()) {
    return appendMemoryEvent(input);
  }

  try {
    const event = await prisma.lockdownEvent.create({
      data: {
        sessionId: input.sessionId,
        eventType: input.eventType,
        detail: input.detail,
        severity: input.severity
      }
    });

    return {
      id: event.id,
      sessionId: event.sessionId,
      at: event.at.toISOString(),
      eventType: event.eventType as LockdownEventType,
      detail: event.detail,
      severity: event.severity as LockdownEventSeverity
    };
  } catch (error) {
    if (!DEV_MEMORY_FALLBACK) {
      rethrowLockdownStoreError(error);
    }
    return appendMemoryEvent(input);
  }
}

export async function getLockdownSessionEvents(sessionId: string): Promise<LockdownAuditEvent[]> {
  if (shouldUseMemoryOnly()) {
    return memoryEventsById(sessionId);
  }

  try {
    const events = await prisma.lockdownEvent.findMany({
      where: { sessionId },
      orderBy: {
        at: "desc"
      },
      take: 300
    });

    return events
      .reverse()
      .map((event) => ({
        id: event.id,
        sessionId: event.sessionId,
        at: event.at.toISOString(),
        eventType: event.eventType as LockdownEventType,
        detail: event.detail,
        severity: event.severity as LockdownEventSeverity
      }));
  } catch (error) {
    if (!DEV_MEMORY_FALLBACK) {
      rethrowLockdownStoreError(error);
    }
    return memoryEventsById(sessionId);
  }
}

export async function touchLockdownSession(sessionId: string): Promise<LockdownSession | null> {
  if (shouldUseMemoryOnly()) {
    const session = memorySessionById(sessionId);
    if (!session) return null;
    session.lastHeartbeatAt = new Date().toISOString();
    return session;
  }

  try {
    const session = await prisma.lockdownSession.update({
      where: { id: sessionId },
      data: {
        lastHeartbeatAt: new Date()
      }
    });
    return toLockdownSession(session);
  } catch (error) {
    if (!DEV_MEMORY_FALLBACK) {
      rethrowLockdownStoreError(error);
    }
    const session = memorySessionById(sessionId);
    if (!session) return null;
    session.lastHeartbeatAt = new Date().toISOString();
    return session;
  }
}

export async function updateIntegrityCounters(
  sessionId: string,
  mutate: (integrity: LockdownIntegrityState) => void
): Promise<LockdownSession | null> {
  if (shouldUseMemoryOnly()) {
    const session = memorySessionById(sessionId);
    if (!session) return null;
    mutate(session.integrity);
    return session;
  }

  try {
    const session = await prisma.lockdownSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      const fallbackSession = memorySessionById(sessionId);
      if (!fallbackSession) return null;
      mutate(fallbackSession.integrity);
      return fallbackSession;
    }

    const integrity = parseIntegrityState(session.integrity);
    mutate(integrity);

    const updated = await prisma.lockdownSession.update({
      where: { id: sessionId },
      data: {
        integrity
      }
    });

    return toLockdownSession(updated);
  } catch (error) {
    if (!DEV_MEMORY_FALLBACK) {
      rethrowLockdownStoreError(error);
    }
    const session = memorySessionById(sessionId);
    if (!session) return null;
    mutate(session.integrity);
    return session;
  }
}

export async function terminateLockdownSession(sessionId: string, reason: string): Promise<LockdownSession | null> {
  if (shouldUseMemoryOnly()) {
    const session = memorySessionById(sessionId);
    if (!session) return null;
    session.status = "terminated";
    session.terminationReason = reason;
    session.completedAt = new Date().toISOString();
    return session;
  }

  try {
    const updated = await prisma.lockdownSession.update({
      where: { id: sessionId },
      data: {
        status: "terminated",
        terminationReason: reason,
        completedAt: new Date()
      }
    });
    return toLockdownSession(updated);
  } catch (error) {
    if (!DEV_MEMORY_FALLBACK) {
      rethrowLockdownStoreError(error);
    }
    const session = memorySessionById(sessionId);
    if (!session) return null;
    session.status = "terminated";
    session.terminationReason = reason;
    session.completedAt = new Date().toISOString();
    return session;
  }
}

export async function completeLockdownSession(sessionId: string, result: LockdownResult): Promise<LockdownSession | null> {
  if (shouldUseMemoryOnly()) {
    const session = memorySessionById(sessionId);
    if (!session) return null;
    session.status = "completed";
    session.completedAt = new Date().toISOString();
    session.result = result;
    return session;
  }

  try {
    const updated = await prisma.lockdownSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        completedAt: new Date(),
        result
      }
    });
    return toLockdownSession(updated);
  } catch (error) {
    if (!DEV_MEMORY_FALLBACK) {
      rethrowLockdownStoreError(error);
    }
    const session = memorySessionById(sessionId);
    if (!session) return null;
    session.status = "completed";
    session.completedAt = new Date().toISOString();
    session.result = result;
    return session;
  }
}

export function isSessionStale(session: LockdownSession) {
  const last = Date.parse(session.lastHeartbeatAt);
  if (!Number.isFinite(last)) {
    return true;
  }
  return Date.now() - last > LOCKDOWN_HEARTBEAT_MAX_AGE_MS;
}
