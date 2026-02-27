"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AuditFeed, { AuditEvent } from "@/components/assessments/wpm/AuditFeed";
import IntegrityPanel from "@/components/assessments/wpm/IntegrityPanel";
import PromptRenderer from "@/components/assessments/wpm/PromptRenderer";
import { LOCKDOWN_MAX_FOCUS_LOSS, LOCKDOWN_MAX_FULLSCREEN_EXITS, LOCKDOWN_MULTI_TAB_KEY } from "@/lib/assessments/lockdown/constants";
import { calculateCadenceMetrics, calculateWpmScore } from "@/lib/assessments/wpm/scoring";

const HEARTBEAT_MS = 8_000;
const DEFAULT_DURATION_SEC = 60;

type Phase = "boot" | "ready" | "active" | "completed" | "terminated";

type LaunchBootstrap = {
  sessionId: string;
  deviceId: string;
  assessmentId: string;
  assessmentName: string;
  promptId: string;
  promptText: string;
  durationSec: number;
  startedAt: string;
};

type WpmSecureRuntimeProps = {
  assessmentId: string;
  assessmentName: string;
  candidateId: string;
  candidateName: string;
};

function launchBootstrapKey(sessionId: string) {
  return `ctrl_secure_launch_${sessionId}`;
}

function formatAuditTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

function formatClock(seconds: number) {
  const mins = Math.floor(Math.max(seconds, 0) / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(Math.max(seconds, 0) % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function integrityScore(input: {
  focusLossCount: number;
  fullscreenExitCount: number;
  pasteAttempts: number;
  multiTabDetected: boolean;
  suspiciousBurstDetected: boolean;
}) {
  let score = 100;
  score -= input.focusLossCount * 10;
  score -= input.fullscreenExitCount * 14;
  score -= input.pasteAttempts * 12;
  if (input.multiTabDetected) score -= 40;
  if (input.suspiciousBurstDetected) score -= 12;
  return clamp(Math.round(score), 0, 100);
}

export default function WpmSecureRuntime({ assessmentId, assessmentName, candidateId, candidateName }: WpmSecureRuntimeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const keyIntervalsRef = useRef<number[]>([]);
  const lastKeydownAtRef = useRef<number | null>(null);
  const finishingRef = useRef(false);
  const fullScreenActiveRef = useRef(false);
  const focusLossThrottleRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("boot");
  const [bootstrap, setBootstrap] = useState<LaunchBootstrap | null>(null);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION_SEC);
  const [typedText, setTypedText] = useState("");
  const [backspaces, setBackspaces] = useState(0);
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [multiTabDetected, setMultiTabDetected] = useState(false);
  const [suspiciousBurstDetected, setSuspiciousBurstDetected] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [terminatedReason, setTerminatedReason] = useState("");
  const [submissionPayload, setSubmissionPayload] = useState<Record<string, unknown> | null>(null);
  const [activationError, setActivationError] = useState("");

  const addAudit = useCallback((type: AuditEvent["type"], message: string) => {
    setAuditEvents((previous) => [...previous, { at: formatAuditTime(), type, message }].slice(-120));
  }, []);

  const showWarning = useCallback((message: string) => {
    setWarningMessage(message);
    window.setTimeout(() => {
      setWarningMessage((current) => (current === message ? "" : current));
    }, 2400);
  }, []);

  const warningsCount = useMemo(() => {
    const fromSignals = focusLossCount + fullscreenExitCount + pasteAttempts;
    return fromSignals + (multiTabDetected ? 1 : 0) + (suspiciousBurstDetected ? 1 : 0);
  }, [focusLossCount, fullscreenExitCount, multiTabDetected, pasteAttempts, suspiciousBurstDetected]);

  const running = phase === "active";
  const refreshGuardActive = phase === "ready" || phase === "active";

  const postEvent = useCallback(
    async (eventType: string, detail: string, severity: "info" | "warning" | "critical") => {
      if (!bootstrap) return;
      await fetch("/api/assessment/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: bootstrap.sessionId,
          deviceId: bootstrap.deviceId,
          eventType,
          detail,
          severity
        })
      }).catch(() => null);
    },
    [bootstrap]
  );

  const clearSessionLock = useCallback(() => {
    if (!bootstrap || typeof window === "undefined") {
      return;
    }
    try {
      const raw = window.localStorage.getItem(LOCKDOWN_MULTI_TAB_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { sessionId?: string };
      if (parsed?.sessionId === bootstrap.sessionId) {
        window.localStorage.removeItem(LOCKDOWN_MULTI_TAB_KEY);
      }
    } catch {
      window.localStorage.removeItem(LOCKDOWN_MULTI_TAB_KEY);
    }
  }, [bootstrap]);

  const completeWithTermination = useCallback(
    async (reason: string) => {
      if (!bootstrap || finishingRef.current) return;
      finishingRef.current = true;
      setTerminatedReason(reason);
      setPhase("terminated");
      clearSessionLock();
      await postEvent("SESSION_TERMINATED", reason, "critical");

      await fetch("/api/assessment/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: bootstrap.sessionId,
          deviceId: bootstrap.deviceId,
          status: "terminated",
          terminationReason: reason
        })
      }).catch(() => null);
    },
    [bootstrap, clearSessionLock, postEvent]
  );

  useEffect(() => {
    const sessionId = searchParams.get("session");
    if (!sessionId) {
      setActivationError("Secure session reference is missing. Re-open this assessment from My Assessments.");
      setPhase("terminated");
      return;
    }

    const launch = (() => {
      if (typeof window === "undefined") return null;
      try {
        const raw = window.sessionStorage.getItem(launchBootstrapKey(sessionId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as LaunchBootstrap;
        if (!parsed || parsed.sessionId !== sessionId) return null;
        return parsed;
      } catch {
        return null;
      }
    })();
    if (!launch || launch.assessmentId !== assessmentId) {
      setActivationError("Secure session bootstrap is unavailable. Please restart validation from the assessment page.");
      setPhase("terminated");
      return;
    }

    setBootstrap(launch);
    setTimeLeft(launch.durationSec || DEFAULT_DURATION_SEC);
    setPhase("ready");
    addAudit("SYSTEM", "Secure runtime loaded");
    addAudit("SYSTEM", `Prompt selected: ${launch.promptId}`);
  }, [addAudit, assessmentId, searchParams]);

  useEffect(() => {
    if (!running || !bootstrap) {
      return;
    }

    const sendHeartbeat = async () => {
      const response = await fetch("/api/assessment/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: bootstrap.sessionId,
          deviceId: bootstrap.deviceId,
          timerRemainingSec: timeLeft
        })
      });

      const data = (await response.json().catch(() => ({}))) as {
        status?: "active" | "completed" | "terminated";
        terminationReason?: string | null;
      };
      if (!response.ok) {
        showWarning("Secure heartbeat interrupted.");
        return;
      }

      if (data.status === "terminated") {
        await completeWithTermination(data.terminationReason ?? "Session terminated by server policy.");
      }
    };

    void sendHeartbeat();
    heartbeatTimerRef.current = window.setInterval(() => {
      void sendHeartbeat();
    }, HEARTBEAT_MS);

    return () => {
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current);
      }
    };
  }, [bootstrap, completeWithTermination, running, showWarning, timeLeft]);

  useEffect(() => {
    if (!running) {
      return;
    }
    if (timeLeft <= 0) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);
    return () => window.clearTimeout(timerId);
  }, [running, timeLeft]);

  const finalizeCompleted = useCallback(async () => {
    if (!bootstrap || finishingRef.current) return;
    finishingRef.current = true;

    const score = calculateWpmScore({
      promptText: bootstrap.promptText,
      typedText,
      durationSec: bootstrap.durationSec || DEFAULT_DURATION_SEC,
      backspaces
    });
    const cadence = calculateCadenceMetrics(keyIntervalsRef.current);
    const integrity = {
      score: integrityScore({
        focusLossCount,
        fullscreenExitCount,
        pasteAttempts,
        multiTabDetected,
        suspiciousBurstDetected
      }),
      focusLossCount,
      fullscreenExitCount,
      pasteAttempts,
      multiTabDetected,
      suspiciousBurstDetected,
      warningsCount
    };

    const payload = {
      candidateId,
      assessmentId: bootstrap.assessmentId,
      sessionId: bootstrap.sessionId,
      startedAt: bootstrap.startedAt,
      completedAt: new Date().toISOString(),
      durationSec: bootstrap.durationSec || DEFAULT_DURATION_SEC,
      grossWpm: score.grossWpm,
      netWpm: score.netWpm,
      accuracy: score.accuracy,
      errors: score.errors,
      charactersTyped: score.charactersTyped,
      backspaces: score.backspaces,
      cadence,
      integrity
    };

    setSubmissionPayload(payload);
    await postEvent("ASSESSMENT_SUBMIT", "Assessment submit requested by candidate.", "info");

    const response = await fetch("/api/assessment/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: bootstrap.sessionId,
        deviceId: bootstrap.deviceId,
        status: "completed",
        result: {
          grossWpm: score.grossWpm,
          netWpm: score.netWpm,
          accuracy: score.accuracy,
          errors: score.errors,
          charactersTyped: score.charactersTyped,
          backspaces: score.backspaces,
          cadence,
          integrity
        }
      })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      finishingRef.current = false;
      await completeWithTermination(data.error ?? "Submission rejected by secure runtime policy.");
      return;
    }

    clearSessionLock();
    setPhase("completed");
    addAudit("ACTION", "Assessment submitted for review");
  }, [
    addAudit,
    backspaces,
    bootstrap,
    candidateId,
    clearSessionLock,
    completeWithTermination,
    focusLossCount,
    fullscreenExitCount,
    multiTabDetected,
    pasteAttempts,
    postEvent,
    suspiciousBurstDetected,
    typedText,
    warningsCount
  ]);

  useEffect(() => {
    if (running && timeLeft <= 0) {
      void finalizeCompleted();
    }
  }, [finalizeCompleted, running, timeLeft]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      const now = Date.now();
      if (now - focusLossThrottleRef.current < 350) return;
      focusLossThrottleRef.current = now;
      setFocusLossCount((previous) => previous + 1);
      addAudit("INTEGRITY", "Focus left assessment window");
      void postEvent("FOCUS_LOSS", "Focus left assessment window.", "warning");
      showWarning("Session Integrity Warning: focus lost.");
    };

    const onBlur = () => {
      const now = Date.now();
      if (now - focusLossThrottleRef.current < 350) return;
      focusLossThrottleRef.current = now;
      setFocusLossCount((previous) => previous + 1);
      addAudit("INTEGRITY", "Window blur detected");
      void postEvent("FOCUS_LOSS", "Window blur detected.", "warning");
      showWarning("Session Integrity Warning: focus lost.");
    };

    const onFocus = () => {
      addAudit("SYSTEM", "Focus returned");
      void postEvent("FOCUS_REGAINED", "Focus returned to secure assessment.", "info");
    };

    const onFullscreenChange = () => {
      const isFullscreen = Boolean(document.fullscreenElement);
      if (!fullScreenActiveRef.current && isFullscreen) {
        fullScreenActiveRef.current = true;
        addAudit("SYSTEM", "Fullscreen enabled");
        void postEvent("FULLSCREEN_ENTER", "Fullscreen entered.", "info");
        return;
      }

      if (fullScreenActiveRef.current && !isFullscreen) {
        fullScreenActiveRef.current = false;
        setFullscreenExitCount((previous) => previous + 1);
        addAudit("INTEGRITY", "Fullscreen exited");
        void postEvent("FULLSCREEN_EXIT", "Fullscreen exited during active session.", "warning");
        showWarning("Session Integrity Warning: fullscreen exited.");
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== LOCKDOWN_MULTI_TAB_KEY || !bootstrap) return;
      if (!event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as { sessionId?: string };
        if (parsed?.sessionId && parsed.sessionId !== bootstrap.sessionId) {
          setMultiTabDetected(true);
          addAudit("INTEGRITY", "Multiple tab lock conflict detected");
          void postEvent("MULTI_TAB_DETECTED", "Another active tab attempted to lock secure session.", "critical");
          void completeWithTermination("Integrity Violation: multiple tabs detected.");
        }
      } catch {
        setMultiTabDetected(true);
        void completeWithTermination("Integrity Violation: invalid multi-tab lock state.");
      }
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "PrintScreen" || (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "i")) {
        addAudit("INTEGRITY", `Keyboard event flagged: ${event.key}`);
        void postEvent("KEYBOARD_EVENT", `Keyboard event flagged: ${event.key}`, "warning");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener("keydown", onKeydown);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("keydown", onKeydown);
    };
  }, [addAudit, bootstrap, completeWithTermination, postEvent, running, showWarning]);

  useEffect(() => {
    if (!refreshGuardActive) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const onRefreshShortcut = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isRefreshKey = key === "f5" || ((event.ctrlKey || event.metaKey) && key === "r");
      if (!isRefreshKey) {
        return;
      }
      event.preventDefault();
      showWarning("Refresh is blocked while assessment secure mode is active.");
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("keydown", onRefreshShortcut);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("keydown", onRefreshShortcut);
    };
  }, [refreshGuardActive, showWarning]);

  useEffect(() => {
    if (!running) return;
    if (focusLossCount >= LOCKDOWN_MAX_FOCUS_LOSS) {
      void completeWithTermination("Integrity Violation: focus lost threshold exceeded.");
    }
  }, [completeWithTermination, focusLossCount, running]);

  useEffect(() => {
    if (!running) return;
    if (fullscreenExitCount >= LOCKDOWN_MAX_FULLSCREEN_EXITS) {
      void completeWithTermination("Integrity Violation: fullscreen exit threshold exceeded.");
    }
  }, [completeWithTermination, fullscreenExitCount, running]);

  const activateSecureMode = useCallback(async () => {
    if (!bootstrap) return;

    setActivationError("");
    try {
      const existing = window.localStorage.getItem(LOCKDOWN_MULTI_TAB_KEY);
      if (existing) {
        const parsed = JSON.parse(existing) as { sessionId?: string; at?: string };
        if (parsed?.sessionId && parsed.sessionId !== bootstrap.sessionId) {
          setActivationError("Another secure session lock is active. Close other assessment tabs first.");
          return;
        }
      }
    } catch {
      setActivationError("Unable to verify multi-tab lock state.");
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
      fullScreenActiveRef.current = true;
      addAudit("SYSTEM", "Fullscreen requested on secure mode entry");
      await postEvent("FULLSCREEN_ENTER", "Fullscreen enabled at secure mode entry.", "info");
    } catch {
      setFullscreenExitCount((previous) => previous + 1);
      addAudit("INTEGRITY", "Fullscreen request denied");
      await postEvent("FULLSCREEN_EXIT", "Fullscreen request denied on secure mode entry.", "warning");
      showWarning("Fullscreen request denied. Integrity warning recorded.");
    }

    window.localStorage.setItem(
      LOCKDOWN_MULTI_TAB_KEY,
      JSON.stringify({
        sessionId: bootstrap.sessionId,
        assessmentId: bootstrap.assessmentId,
        at: new Date().toISOString()
      })
    );

    setPhase("active");
    addAudit("ACTION", "Secure mode active");
    inputRef.current?.focus();
  }, [addAudit, bootstrap, postEvent, showWarning]);

  const handleExit = useCallback(() => {
    if (phase === "completed") {
      router.push("/portal/candidate/assessments");
      return;
    }
    const confirmed = window.confirm(
      "Exit secure mode? This will terminate your current assessment session and record an integrity event."
    );
    if (!confirmed) {
      return;
    }
    void completeWithTermination("Candidate exited secure mode before completion.");
  }, [completeWithTermination, phase, router]);

  if (phase === "boot") {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0B1220] p-6 text-sm text-[#9CA3AF]">
        Initializing secure assessment runtime...
      </div>
    );
  }

  const promptText = bootstrap?.promptText ?? "";
  const durationSec = bootstrap?.durationSec ?? DEFAULT_DURATION_SEC;
  const elapsedSec = durationSec - timeLeft;
  const progressPercent = clamp((elapsedSec / durationSec) * 100, 0, 100);
  const liveMetrics = calculateWpmScore({
    promptText,
    typedText,
    durationSec: Math.max(elapsedSec, 1),
    backspaces
  });

  const timerLabel = phase === "active" ? `Timer ${formatClock(timeLeft)}` : `Timer ${formatClock(durationSec)}`;

  return (
    <div className="h-full overflow-hidden bg-[#0B1220] text-[#E5E7EB]">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#020617]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-3 px-4 md:px-6">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Candidate Portal</p>
            <p className="truncate text-sm font-medium text-[#D7DEEA]">{assessmentName}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#D7DEEA] sm:inline-flex">
              <span className="font-medium">{timerLabel}</span>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                running
                  ? "border-[rgb(var(--role-accent-rgb)/0.48)] bg-[rgb(var(--role-accent-rgb)/0.2)] text-white"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-200"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[var(--role-accent)]" />
              {running ? "Secure Mode Active" : "Secure Mode Pending"}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#C3CDDA]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Warnings {warningsCount}
            </div>
            <button
              type="button"
              onClick={handleExit}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#D7DEEA] transition-colors hover:bg-white/10"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="h-full overflow-y-auto overflow-x-hidden pt-[72px]">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6">
          <div className="mb-4 rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">
              Candidate {candidateName} · {candidateId}
            </p>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              Secure lockdown mode enforces fullscreen, focus continuity, and single-tab execution controls.
            </p>
          </div>

          {warningMessage ? (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              {warningMessage}
            </div>
          ) : null}

          {activationError ? (
            <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {activationError}
            </div>
          ) : null}

          {phase === "ready" ? (
            <section className="rounded-xl border border-white/10 bg-[#0B1220] p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Secure Mode Activation</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#E5E7EB]">Activate Lockdown Session</h2>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                Fullscreen is requested on activation. Heartbeat and integrity listeners start immediately.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void activateSecureMode();
                  }}
                  className="rounded-md border border-[#5B7EA6]/60 bg-[#5B7EA6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6f93bd]"
                >
                  Begin Secure Assessment
                </button>
                <Link
                  href={`/portal/candidate/assessments/${assessmentId}`}
                  className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#D7DEEA] transition-colors hover:bg-white/10"
                >
                  Return to Assessment
                </Link>
              </div>
            </section>
          ) : null}

          {phase === "terminated" ? (
            <section className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-rose-200">Assessment Terminated (Integrity)</p>
              <h2 className="mt-2 text-2xl font-semibold text-rose-100">Session Integrity Violation</h2>
              <p className="mt-2 text-sm text-rose-100/90">
                {terminatedReason || activationError || "Secure runtime policy ended this assessment session."}
              </p>
              <div className="mt-4">
                <Link
                  href="/portal/candidate/assessments"
                  className="inline-flex rounded-md border border-white/10 bg-[#08172C] px-4 py-2 text-sm font-medium text-[#D7DEEA] transition-colors hover:bg-[#11233d]"
                >
                  Return to Portal
                </Link>
              </div>
            </section>
          ) : null}

          {phase === "active" || phase === "completed" ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-4">
                <section className="rounded-xl border border-white/10 bg-[#0B1220] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Instructions</p>
                  <ul className="mt-3 space-y-1 text-sm text-[#C3CDDA]">
                    <li>• Complete the typing prompt within {durationSec} seconds.</li>
                    <li>• Pasting content is blocked and recorded as an integrity event.</li>
                    <li>• Exiting fullscreen or leaving focus may terminate the session.</li>
                  </ul>
                </section>

                <section className="rounded-xl border border-white/10 bg-[#0B1220] p-4">
                  <PromptRenderer
                    promptText={promptText}
                    typedText={typedText}
                    onCopyAttempt={() => {
                      void postEvent("COPY_ATTEMPT", "Copy attempt blocked from prompt text.", "warning");
                      addAudit("INTEGRITY", "Copy attempt blocked");
                    }}
                    onCutAttempt={() => {
                      void postEvent("CUT_ATTEMPT", "Cut attempt blocked from prompt text.", "warning");
                      addAudit("INTEGRITY", "Cut attempt blocked");
                    }}
                  />

                  <label className="mt-3 block text-xs uppercase tracking-[0.12em] text-[#8FA1B8]" htmlFor="secure-typing-input">
                    Secure Typing Input
                  </label>
                  <textarea
                    id="secure-typing-input"
                    ref={inputRef}
                    value={typedText}
                    onChange={(event) => {
                      if (!running) return;
                      const nextValue = event.target.value;
                      const jump = nextValue.length - typedText.length;
                      if (jump > 10 && !suspiciousBurstDetected) {
                        setSuspiciousBurstDetected(true);
                        addAudit("INTEGRITY", "Suspicious input burst detected");
                        void postEvent("SUSPICIOUS_BURST", "Input length jumped by >10 chars in a single event.", "warning");
                      }
                      setTypedText(nextValue);
                    }}
                    onKeyDown={(event) => {
                      if (!running) return;
                      const now = performance.now();
                      if (lastKeydownAtRef.current !== null) {
                        keyIntervalsRef.current.push(now - lastKeydownAtRef.current);
                      }
                      lastKeydownAtRef.current = now;
                      if (event.key === "Backspace") {
                        setBackspaces((previous) => previous + 1);
                      }
                    }}
                    onPaste={(event) => {
                      event.preventDefault();
                      setPasteAttempts((previous) => previous + 1);
                      addAudit("INTEGRITY", "Paste blocked in secure input");
                      void postEvent("PASTE_BLOCKED", "Paste blocked in secure typing input.", "warning");
                      showWarning("Paste blocked.");
                    }}
                    disabled={!running}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    rows={6}
                    className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-[#08172C] p-3 text-sm text-[#E5E7EB] placeholder:text-[#64748B] focus:border-[#5B7EA6] focus:outline-none focus:ring-2 focus:ring-[#5B7EA6]/30 disabled:cursor-not-allowed disabled:opacity-70"
                    placeholder={running ? "Type the prompt text exactly as shown..." : "Assessment input disabled"}
                  />

                  <div className="mt-4 rounded-lg border border-white/10 bg-[#08172C] p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-[#8FA1B8]">
                      <span>Progress</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#0B1220]">
                      <div className="h-full rounded-full bg-[#5B7EA6] transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-[#C3CDDA] sm:grid-cols-4">
                      <p>Gross WPM: {liveMetrics.grossWpm}</p>
                      <p>Net WPM: {liveMetrics.netWpm}</p>
                      <p>Accuracy: {liveMetrics.accuracy}%</p>
                      <p>Characters: {liveMetrics.charactersTyped}</p>
                    </div>
                  </div>

                  {phase === "active" ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          void finalizeCompleted();
                        }}
                        className="rounded-md border border-[#5B7EA6]/60 bg-[#5B7EA6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6f93bd]"
                      >
                        Submit Assessment
                      </button>
                    </div>
                  ) : null}

                  {phase === "completed" && submissionPayload ? (
                    <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <p className="text-sm font-semibold text-emerald-200">Submitted for review</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-md border border-white/10 bg-[#08172C] px-3 py-2">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">WPM</p>
                          <p className="mt-1 text-xl font-semibold text-[#E5E7EB]">
                            {String(submissionPayload.netWpm ?? submissionPayload.grossWpm ?? 0)}
                          </p>
                        </div>
                        <div className="rounded-md border border-white/10 bg-[#08172C] px-3 py-2">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Accuracy</p>
                          <p className="mt-1 text-xl font-semibold text-[#E5E7EB]">
                            {String(submissionPayload.accuracy ?? 0)}%
                          </p>
                        </div>
                        <div className="rounded-md border border-white/10 bg-[#08172C] px-3 py-2">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Integrity Score</p>
                          <p className="mt-1 text-xl font-semibold text-[#E5E7EB]">
                            {String((submissionPayload.integrity as { score?: number } | undefined)?.score ?? 0)}
                          </p>
                        </div>
                      </div>

                      <pre className="mt-3 max-h-64 overflow-auto rounded-md border border-white/10 bg-[#020617] p-3 text-xs text-[#C3CDDA]">
{JSON.stringify(submissionPayload, null, 2)}
                      </pre>
                      <div className="mt-3">
                        <Link
                          href="/portal/candidate/assessments"
                          className="inline-flex rounded-md border border-white/10 bg-[#08172C] px-4 py-2 text-sm font-medium text-[#D7DEEA] hover:bg-[#11233d]"
                        >
                          Return to Portal
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </section>
              </div>

              <div className="space-y-4">
                <IntegrityPanel
                  focusLossCount={focusLossCount}
                  tabSwitchCount={focusLossCount}
                  pasteAttempts={pasteAttempts}
                  fullscreenEnabled={fullScreenActiveRef.current}
                  suspiciousBurstDetected={suspiciousBurstDetected}
                  violationCount={warningsCount}
                />
                <AuditFeed events={auditEvents} />
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
