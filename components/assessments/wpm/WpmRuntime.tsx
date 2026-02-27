"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Clock3 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AssessmentEnvironmentRestrictionPanel from "@/components/assessments/AssessmentEnvironmentRestrictionPanel";
import AuditFeed, { AuditEvent } from "@/components/assessments/wpm/AuditFeed";
import IntegrityPanel from "@/components/assessments/wpm/IntegrityPanel";
import PromptRenderer from "@/components/assessments/wpm/PromptRenderer";
import { useAssessmentEnvironment } from "@/lib/hooks/useAssessmentEnvironment";
import { selectRandomPrompt, WpmPrompt } from "@/lib/assessments/wpm/prompts";
import { calculateWpmScore, WpmScoreResult } from "@/lib/assessments/wpm/scoring";

type WpmRuntimeProps = {
  candidateId: string;
  candidateName: string;
};

type Phase = "ready" | "warmup" | "active" | "completed";

const TEST_DURATION_SEC = 60;
const WARMUP_DURATION_SEC = 5;
const MAX_ATTEMPTS = 1;
const PROCTOR_OVERRIDE_ENABLED = false;

function formatClock(seconds: number) {
  const mins = Math.floor(Math.max(seconds, 0) / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(Math.max(seconds, 0) % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatAuditTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

export default function WpmRuntime({ candidateId, candidateName }: WpmRuntimeProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const environment = useAssessmentEnvironment();
  const runtimeRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const warningTimeoutRef = useRef<number | undefined>(undefined);
  const lastFocusLossAtRef = useRef(0);
  const lastFullscreenStateRef = useRef(false);
  const hasCompletedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("ready");
  const [warmupLeft, setWarmupLeft] = useState(WARMUP_DURATION_SEC);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SEC);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(false);
  const [prompt, setPrompt] = useState<WpmPrompt>(() => selectRandomPrompt());
  const [typedText, setTypedText] = useState("");
  const [backspaces, setBackspaces] = useState(0);
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [fullscreenEnabled, setFullscreenEnabled] = useState(false);
  const [fullscreenEverEnabled, setFullscreenEverEnabled] = useState(false);
  const [suspiciousBurstDetected, setSuspiciousBurstDetected] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [result, setResult] = useState<WpmScoreResult | null>(null);
  const [submissionPrepared, setSubmissionPrepared] = useState(false);
  const [launchValidationInProgress, setLaunchValidationInProgress] = useState(false);

  const running = phase === "warmup" || phase === "active";

  const addAudit = useCallback((type: AuditEvent["type"], message: string) => {
    setAuditEvents((previous) => [...previous, { at: formatAuditTime(), type, message }].slice(-120));
  }, []);

  const announceWarning = useCallback((message: string) => {
    setWarningMessage(message);
    if (typeof warningTimeoutRef.current === "number") {
      window.clearTimeout(warningTimeoutRef.current);
    }
    warningTimeoutRef.current = window.setTimeout(() => {
      setWarningMessage("");
    }, 2800);
  }, []);

  const registerFocusLoss = useCallback(
    (source: "blur" | "visibility") => {
      if (phase !== "active") {
        return;
      }

      const now = Date.now();
      if (now - lastFocusLossAtRef.current < 450) {
        return;
      }
      lastFocusLossAtRef.current = now;

      setFocusLossCount((previous) => {
        const next = previous + 1;
        addAudit("INTEGRITY", `Focus lost (count=${next}, source=${source})`);
        return next;
      });
      setTabSwitchCount((previous) => previous + 1);
      setViolationCount((previous) => previous + 1);
      announceWarning("Focus left assessment window");
    },
    [addAudit, announceWarning, phase]
  );

  const resetAttemptState = useCallback(
    (nextPrompt: WpmPrompt) => {
      hasCompletedRef.current = false;
      setPhase("ready");
      setWarmupLeft(WARMUP_DURATION_SEC);
      setTimeLeft(TEST_DURATION_SEC);
      setTypedText("");
      setBackspaces(0);
      setFocusLossCount(0);
      setTabSwitchCount(0);
      setPasteAttempts(0);
      setFullscreenEnabled(Boolean(document.fullscreenElement));
      setFullscreenEverEnabled(Boolean(document.fullscreenElement));
      setSuspiciousBurstDetected(false);
      setViolationCount(0);
      setWarningMessage("");
      setStartedAt(null);
      setCompletedAt(null);
      setResult(null);
      setSubmissionPrepared(false);
      setInstructionsCollapsed(false);
      setPrompt(nextPrompt);
    },
    []
  );

  const completeTest = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }
    hasCompletedRef.current = true;

    const finishedAt = new Date().toISOString();
    const score = calculateWpmScore({
      promptText: prompt.text,
      typedText,
      durationSec: TEST_DURATION_SEC,
      backspaces
    });

    setResult(score);
    setCompletedAt(finishedAt);
    setPhase("completed");
    setTimeLeft(0);
    addAudit("ACTION", "Test completed");
    addAudit("SYSTEM", "Results computed");
  }, [addAudit, backspaces, prompt.text, typedText]);

  const requestFullscreen = useCallback(async () => {
    const target = runtimeRef.current;
    if (!target || !target.requestFullscreen) {
      addAudit("INTEGRITY", "Fullscreen API unavailable");
      announceWarning("Fullscreen unavailable. Assessment continues with flag.");
      return;
    }

    try {
      await target.requestFullscreen();
      setFullscreenEnabled(true);
      setFullscreenEverEnabled(true);
      addAudit("SYSTEM", "Fullscreen enabled");
    } catch {
      addAudit("INTEGRITY", "Fullscreen request denied");
      announceWarning("Fullscreen denied. Integrity flag recorded.");
    }
  }, [addAudit, announceWarning]);

  const startAssessment = useCallback(async () => {
    if (attemptsUsed >= MAX_ATTEMPTS) {
      announceWarning("Maximum attempts reached. Request a retake.");
      return;
    }

    if (!environment.ready || !environment.valid || !environment.payload) {
      announceWarning("Assessment launch blocked by environment policy.");
      addAudit("INTEGRITY", "Launch blocked: environment validation failed");
      return;
    }

    setLaunchValidationInProgress(true);
    try {
      const response = await fetch("/api/assessments/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          environment: environment.payload
        })
      });

      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        restriction?: { reasons?: string[] };
      };
      if (!response.ok) {
        const detail = body.restriction?.reasons?.[0] ?? body.error ?? "Assessment launch blocked.";
        announceWarning(detail);
        addAudit("INTEGRITY", `Launch blocked: ${detail}`);
        return;
      }
      addAudit("SYSTEM", "Assessment launch authorized");
    } catch {
      announceWarning("Unable to initialize secure assessment launch.");
      addAudit("INTEGRITY", "Launch failed: assessment start API unavailable");
      return;
    } finally {
      setLaunchValidationInProgress(false);
    }

    const promptForAttempt = selectRandomPrompt(Date.now() + attemptsUsed);
    resetAttemptState(promptForAttempt);
    setInstructionsCollapsed(true);
    setPhase("warmup");
    setAttemptsUsed((previous) => previous + 1);
    addAudit("SYSTEM", `Prompt selected: ${promptForAttempt.id}`);
    addAudit("ACTION", "Test started");
    addAudit("SYSTEM", `Warmup countdown initiated (${WARMUP_DURATION_SEC}s)`);
    await requestFullscreen();
  }, [addAudit, announceWarning, attemptsUsed, environment.payload, environment.ready, environment.valid, requestFullscreen, resetAttemptState]);

  const handleRestart = useCallback(() => {
    if (attemptsUsed > 0 && !PROCTOR_OVERRIDE_ENABLED) {
      announceWarning("Restart locked after first start. Request proctor override.");
      return;
    }
    const nextPrompt = selectRandomPrompt(Date.now() + 99);
    resetAttemptState(nextPrompt);
    addAudit("ACTION", "Runtime reset");
    addAudit("SYSTEM", `Prompt selected: ${nextPrompt.id}`);
  }, [addAudit, announceWarning, attemptsUsed, resetAttemptState]);

  const handleSubmitPreview = useCallback(() => {
    if (phase !== "completed") {
      announceWarning("Submission is available only after completion.");
      return;
    }
    if (!submissionPrepared) {
      setSubmissionPrepared(true);
      addAudit("ACTION", "Submission payload prepared");
    }
  }, [addAudit, announceWarning, phase, submissionPrepared]);

  const handleExit = useCallback(() => {
    if (phase !== "completed") {
      addAudit("ACTION", "Exit attempted before completion");
      announceWarning("Exit disabled until assessment completion.");
      return;
    }
    router.push("/portal/candidate");
  }, [addAudit, announceWarning, phase, router]);

  useEffect(() => {
    addAudit("SYSTEM", "Assessment loaded");
  }, [addAudit]);

  useEffect(() => {
    addAudit("SYSTEM", `Prompt selected: ${prompt.id}`);
  }, [addAudit, prompt.id]);

  useEffect(() => {
    return () => {
      if (typeof warningTimeoutRef.current === "number") {
        window.clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "warmup") {
      return;
    }
    if (warmupLeft <= 0) {
      setPhase("active");
      setStartedAt(new Date().toISOString());
      addAudit("ACTION", "Typing enabled");
      inputRef.current?.focus();
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setWarmupLeft((previous) => previous - 1);
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [addAudit, phase, warmupLeft]);

  useEffect(() => {
    if (phase !== "active") {
      return;
    }
    if (timeLeft <= 0) {
      completeTest();
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [completeTest, phase, timeLeft]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        registerFocusLoss("visibility");
      }
    };

    const onWindowBlur = () => {
      registerFocusLoss("blur");
    };

    const onWindowFocus = () => {
      if (phase === "active") {
        addAudit("SYSTEM", "Focus returned to assessment window");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [addAudit, phase, registerFocusLoss]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isEnabled = Boolean(document.fullscreenElement);
      setFullscreenEnabled(isEnabled);
      if (isEnabled) {
        setFullscreenEverEnabled(true);
      }

      if (lastFullscreenStateRef.current === isEnabled) {
        return;
      }

      if (!isEnabled && running) {
        addAudit("INTEGRITY", "Fullscreen exited during active assessment");
        setViolationCount((previous) => previous + 1);
        announceWarning("Fullscreen exited during assessment");
      }

      if (isEnabled && !lastFullscreenStateRef.current) {
        addAudit("SYSTEM", "Fullscreen enabled");
      }

      lastFullscreenStateRef.current = isEnabled;
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    handleFullscreenChange();
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [addAudit, announceWarning, running]);

  useEffect(() => {
    if (!running) {
      return;
    }
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [running]);

  const elapsedSec = TEST_DURATION_SEC - timeLeft;
  const progressPercent = Math.min(100, (elapsedSec / TEST_DURATION_SEC) * 100);
  const liveMetrics = useMemo(
    () =>
      calculateWpmScore({
        promptText: prompt.text,
        typedText,
        durationSec: Math.max(elapsedSec, 1),
        backspaces
      }),
    [backspaces, elapsedSec, prompt.text, typedText]
  );

  const submissionPayloadPreview = useMemo(() => {
    if (!result || !startedAt || !completedAt) {
      return null;
    }
    return {
      candidateId,
      assessmentId: "wpm",
      startedAt,
      completedAt,
      durationSec: TEST_DURATION_SEC,
      grossWpm: result.grossWpm,
      netWpm: result.netWpm,
      accuracy: result.accuracy,
      errors: result.errors,
      backspaces: result.backspaces,
      integrity: {
        fullscreen: fullscreenEverEnabled,
        focusLossCount,
        pasteAttempts,
        suspiciousBurstDetected
      },
      auditEventsCount: auditEvents.length
    };
  }, [
    auditEvents.length,
    candidateId,
    completedAt,
    focusLossCount,
    fullscreenEverEnabled,
    pasteAttempts,
    result,
    startedAt,
    suspiciousBurstDetected
  ]);

  const canStart =
    phase === "ready" &&
    attemptsUsed < MAX_ATTEMPTS &&
    environment.ready &&
    environment.valid &&
    !launchValidationInProgress;
  const canRestart = attemptsUsed === 0 || PROCTOR_OVERRIDE_ENABLED;

  return (
    <div ref={runtimeRef} className="min-h-full bg-[#0B1220] text-[#E5E7EB]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#020617]">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Image src="/brand/ctrl-lockup.png" alt="CTRL" width={124} height={30} className="h-7 w-auto" priority />
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Candidate Portal</p>
              <p className="text-sm font-medium text-[#C3CDDA]">Typing Speed Assessment (WPM)</p>
            </div>
          </div>

          <div className="hidden h-6 w-px bg-white/10 xl:block" />
          <p className="hidden text-sm font-medium text-[#D7DEEA] xl:block">{candidateName}</p>
          <div className="hidden h-6 w-px bg-white/10 lg:block" />
          <p className="hidden text-xs uppercase tracking-[0.14em] text-[#8FA1B8] lg:block">Candidate ID: {candidateId}</p>

          <div className="ml-auto flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Secure Session
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#C3CDDA]">
              <Clock3 className="h-3.5 w-3.5" />
              {phase === "warmup" ? `Warmup ${warmupLeft}s` : `Timer ${formatClock(timeLeft)}`}
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

      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-4 py-6 md:px-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {environment.ready && !environment.valid ? (
            <AssessmentEnvironmentRestrictionPanel
              title="Assessment Runtime Restricted"
              reasons={environment.reasons}
              checks={environment.checks}
            />
          ) : null}

          {warningMessage ? (
            <div
              aria-live="assertive"
              className="flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{warningMessage}</span>
            </div>
          ) : (
            <div aria-live="polite" className="sr-only" />
          )}

          {!instructionsCollapsed ? (
            <motion.section
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-xl border border-white/10 bg-[#0B1220] p-4"
            >
              <h2 className="text-sm font-semibold text-[#E5E7EB]">Assessment Instructions</h2>
              <ul className="mt-3 space-y-2 text-sm text-[#9CA3AF]">
                <li>Complete the typing task independently within 60 seconds.</li>
                <li>Focus changes, paste attempts, and fullscreen exits are recorded in the integrity log.</li>
                <li>Use your normal typing cadence and avoid external tools or copied content.</li>
                <li>Submission unlocks only after test completion.</li>
              </ul>
            </motion.section>
          ) : (
            <button
              type="button"
              onClick={() => setInstructionsCollapsed(false)}
              className="text-xs font-medium text-[#8FA1B8] underline-offset-4 hover:underline"
            >
              Show instructions
            </button>
          )}

          <motion.section
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.03 }}
            className="rounded-xl border border-white/10 bg-[#0B1220]"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[#E5E7EB]">Typing Runtime</h2>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#C3CDDA]">
                  <span>Candidate</span>
                  <strong className="font-medium text-[#E5E7EB]">{candidateName}</strong>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <PromptRenderer promptText={prompt.text} typedText={typedText} />

              <label className="block text-xs uppercase tracking-[0.12em] text-[#8FA1B8]" htmlFor="typing-input">
                Assessment Input
              </label>
              <textarea
                id="typing-input"
                ref={inputRef}
                value={typedText}
                onChange={(event) => {
                  if (phase !== "active") {
                    return;
                  }

                  const nextValue = event.target.value;
                  const jump = nextValue.length - typedText.length;
                  if (jump > 10 && !suspiciousBurstDetected) {
                    setSuspiciousBurstDetected(true);
                    setViolationCount((previous) => previous + 1);
                    addAudit("INTEGRITY", "Suspicious input pattern detected (burst > 10 chars)");
                    announceWarning("Suspicious input pattern detected");
                  }

                  setTypedText(nextValue);
                }}
                onKeyDown={(event) => {
                  if (phase === "active" && event.key === "Backspace") {
                    setBackspaces((previous) => previous + 1);
                  }
                }}
                onPaste={(event) => {
                  event.preventDefault();
                  setPasteAttempts((previous) => {
                    const next = previous + 1;
                    addAudit("INTEGRITY", `Paste blocked (count=${next})`);
                    return next;
                  });
                  setViolationCount((previous) => previous + 1);
                  announceWarning("Paste blocked");
                }}
                disabled={phase !== "active"}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                rows={5}
                className="w-full resize-none rounded-lg border border-white/10 bg-[#08172C] p-3 text-sm text-[#E5E7EB] placeholder:text-[#64748B] focus:border-[#5B7EA6] focus:outline-none focus:ring-2 focus:ring-[#5B7EA6]/30 disabled:cursor-not-allowed disabled:opacity-70"
                placeholder={
                  phase === "active"
                    ? "Type the prompt text here..."
                    : phase === "warmup"
                      ? `Typing unlocks in ${warmupLeft}s`
                      : "Start assessment to begin typing"
                }
              />

              <div className="rounded-lg border border-white/10 bg-[#08172C] p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-[#8FA1B8]">
                  <span>Progress</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#0B1220]">
                  <div
                    className="h-full rounded-full bg-[#5B7EA6] transition-[width] duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-3 grid gap-2 text-xs text-[#9CA3AF] sm:grid-cols-4">
                  <p>Gross WPM: {liveMetrics.grossWpm}</p>
                  <p>Net WPM: {liveMetrics.netWpm}</p>
                  <p>Accuracy: {liveMetrics.accuracy}%</p>
                  <p>Characters: {liveMetrics.charactersTyped}</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.footer
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.06 }}
            className="space-y-4 rounded-xl border border-white/10 bg-[#0B1220] p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={startAssessment}
                disabled={!canStart}
                className="rounded-md border border-[#5B7EA6]/60 bg-[#5B7EA6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6f93bd] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-[#64748B]"
              >
                {launchValidationInProgress ? "Validating..." : phase === "ready" ? "Start Assessment" : "Assessment Started"}
              </button>
              <button
                type="button"
                onClick={handleSubmitPreview}
                disabled={phase !== "completed"}
                className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#D7DEEA] transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submissionPrepared ? "Submitted (Preview)" : "Submit"}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                disabled={!canRestart}
                className="rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Restart
              </button>
              {attemptsUsed >= MAX_ATTEMPTS ? (
                <Link href="/portal/candidate/support" className="text-sm font-medium text-[#8FA1B8] underline-offset-4 hover:underline">
                  Request Retake
                </Link>
              ) : null}
            </div>

            {result ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-[#08172C] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Gross WPM</p>
                  <p className="mt-1 text-2xl font-semibold text-[#E5E7EB]">{result.grossWpm}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#08172C] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Net WPM</p>
                  <p className="mt-1 text-2xl font-semibold text-[#E5E7EB]">{result.netWpm}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#08172C] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Accuracy</p>
                  <p className="mt-1 text-2xl font-semibold text-[#E5E7EB]">{result.accuracy}%</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#08172C] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Errors</p>
                  <p className="mt-1 text-2xl font-semibold text-[#E5E7EB]">{result.errors}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#08172C] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Characters</p>
                  <p className="mt-1 text-2xl font-semibold text-[#E5E7EB]">{result.charactersTyped}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#08172C] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Backspaces</p>
                  <p className="mt-1 text-2xl font-semibold text-[#E5E7EB]">{result.backspaces}</p>
                </div>
              </div>
            ) : null}

            {submissionPayloadPreview ? (
              <div className="rounded-lg border border-white/10 bg-[#08172C] p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Submission Preview</p>
                <pre className="max-h-72 overflow-auto rounded-md border border-white/10 bg-[#020617] p-3 text-xs text-[#C3CDDA]">
{JSON.stringify(submissionPayloadPreview, null, 2)}
                </pre>
              </div>
            ) : null}
          </motion.footer>
        </div>

        <div className="space-y-4">
          <IntegrityPanel
            focusLossCount={focusLossCount}
            tabSwitchCount={tabSwitchCount}
            pasteAttempts={pasteAttempts}
            fullscreenEnabled={fullscreenEnabled}
            suspiciousBurstDetected={suspiciousBurstDetected}
            violationCount={violationCount}
          />
          <AuditFeed events={auditEvents} />
        </div>
      </div>
    </div>
  );
}
