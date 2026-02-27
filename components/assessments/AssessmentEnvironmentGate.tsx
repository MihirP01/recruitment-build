"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LOCKDOWN_MULTI_TAB_KEY } from "@/lib/assessments/lockdown/constants";
import type { PortalAssessmentCard } from "@/lib/data/types";
import { useAssessmentEnvironment } from "@/lib/hooks/useAssessmentEnvironment";

const LOCK_STALE_MS = 3 * 60 * 60 * 1000;

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

function launchBootstrapKey(sessionId: string) {
  return `ctrl_secure_launch_${sessionId}`;
}

function CheckRow({
  label,
  pass,
  detail
}: {
  label: string;
  pass: boolean;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#D7DEEA]">{label}</p>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
            pass
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {pass ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          {pass ? "Pass" : "Blocked"}
        </span>
      </div>
      <p className="mt-1 text-xs text-[#9CA3AF]">{detail}</p>
    </div>
  );
}

export default function AssessmentEnvironmentGate({ assessment }: { assessment: PortalAssessmentCard }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [multiTabBlocked, setMultiTabBlocked] = useState(false);
  const [multiTabDetail, setMultiTabDetail] = useState("No conflicting active assessment lock detected.");
  const [launchWarnings, setLaunchWarnings] = useState<string[]>([]);

  const environment = useAssessmentEnvironment();
  const payload = environment.payload;

  useEffect(() => {
    if (!open) {
      return;
    }

    const existingLock = (() => {
      if (typeof window === "undefined") {
        return null;
      }

      try {
        const raw = window.localStorage.getItem(LOCKDOWN_MULTI_TAB_KEY);
        if (!raw) {
          return null;
        }

        const parsed = JSON.parse(raw) as { sessionId?: string; at?: string };
        if (!parsed?.sessionId || !parsed?.at) {
          window.localStorage.removeItem(LOCKDOWN_MULTI_TAB_KEY);
          return null;
        }

        const lockAge = Date.now() - Date.parse(parsed.at);
        if (!Number.isFinite(lockAge) || lockAge > LOCK_STALE_MS) {
          window.localStorage.removeItem(LOCKDOWN_MULTI_TAB_KEY);
          return null;
        }

        return parsed;
      } catch {
        return null;
      }
    })();
    if (existingLock?.sessionId) {
      setMultiTabBlocked(true);
      setMultiTabDetail("An active secure assessment is already locked in another tab.");
      return;
    }

    setMultiTabBlocked(false);
    setMultiTabDetail("No conflicting active assessment lock detected.");
  }, [open]);

  const desktopEligible = useMemo(() => {
    if (!payload) return false;
    return !payload.touchDevice && !payload.smallViewport && !payload.mobileUserAgent;
  }, [payload]);

  const fullscreenCapable = Boolean(payload?.fullscreenCapable);
  const multiTabReady = Boolean(payload?.multiTabLockAvailable) && !multiTabBlocked;
  const webdriverDetected = Boolean(payload?.webdriver);

  const blockingReasons = useMemo(() => {
    const reasons = [...environment.reasons];
    if (multiTabBlocked) {
      reasons.push("Another secure assessment lock is active in local browser storage.");
    }
    return Array.from(new Set(reasons));
  }, [environment.reasons, multiTabBlocked]);

  const canProceed =
    environment.ready &&
    Boolean(payload) &&
    blockingReasons.length === 0 &&
    desktopEligible &&
    fullscreenCapable &&
    multiTabReady;

  const handleEnterSecureMode = async () => {
    if (!payload || !canProceed || !acknowledged) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setLaunchWarnings([]);

    try {
      const response = await fetch("/api/assessment/start", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: assessment.id,
          deviceId: payload.fingerprint,
          environment: payload,
          acknowledged: true
        })
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        restriction?: { reasons?: string[] };
        policyWarnings?: string[];
        sessionId?: string;
        startedAt?: string;
        assessment?: {
          id: string;
          name: string;
          promptId: string;
          promptText: string;
          durationSec: number;
        };
      };

      if (!response.ok || !data.sessionId || !data.assessment) {
        if (data.restriction?.reasons?.length) {
          setErrorMessage(data.restriction.reasons[0]!);
        } else {
          setErrorMessage(data.error ?? "Unable to start secure assessment session.");
        }
        return;
      }

      const bootstrap: LaunchBootstrap = {
        sessionId: data.sessionId,
        deviceId: payload.fingerprint,
        assessmentId: data.assessment.id,
        assessmentName: data.assessment.name,
        promptId: data.assessment.promptId,
        promptText: data.assessment.promptText,
        durationSec: data.assessment.durationSec,
        startedAt: data.startedAt ?? new Date().toISOString()
      };
      window.sessionStorage.setItem(launchBootstrapKey(data.sessionId), JSON.stringify(bootstrap));
      setLaunchWarnings(data.policyWarnings ?? []);

      router.push(`/portal/candidate/assessments/${assessment.id}/secure?session=${encodeURIComponent(data.sessionId)}`);
    } catch {
      setErrorMessage("Secure session initialization failed. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="rounded-xl border border-white/10 bg-[#0B1220] p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Environment Validation</p>
        <h2 className="mt-2 text-xl font-semibold text-[#E5E7EB]">Assessment Lockdown Preflight</h2>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Secure mode verifies device controls before launch. Portal access remains available even when execution is
          restricted.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md border border-[#5B7EA6]/60 bg-[#5B7EA6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6f93bd]"
          >
            Start / Resume
          </button>
          <Link
            href="/portal/candidate"
            className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#D7DEEA] transition-colors hover:bg-white/10"
          >
            Return to Dashboard
          </Link>
        </div>
      </section>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="w-full max-w-3xl rounded-xl border border-white/10 bg-[#020617] p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Environment Validation</p>
                  <h3 className="mt-1 text-lg font-semibold text-[#E5E7EB]">{assessment.name}</h3>
                  <p className="mt-1 text-sm text-[#9CA3AF]">
                    Validate execution controls before entering secure mode.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-[#D7DEEA] hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <CheckRow
                  label="Desktop / Laptop Enforcement"
                  pass={desktopEligible}
                  detail="Touch devices, mobile user agents, and narrow viewports are blocked for secure execution."
                />
                <CheckRow
                  label="Fullscreen Capability"
                  pass={fullscreenCapable}
                  detail="Secure mode requires fullscreen API support before runtime launch."
                />
                <CheckRow
                  label="Multi-Tab Session Lock"
                  pass={multiTabReady}
                  detail={multiTabDetail}
                />
                <div className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[#D7DEEA]">Automation Flag (Audit Only)</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
                        webdriverDetected
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      }`}
                    >
                      {webdriverDetected ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {webdriverDetected ? "Detected" : "Clear"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    Webdriver indicators are recorded to audit events and integrity scoring.
                  </p>
                </div>
              </div>

              {blockingReasons.length > 0 ? (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="flex items-center gap-2 text-amber-200">
                    <ShieldAlert className="h-4 w-4" />
                    <p className="text-sm font-semibold">Assessment Launch Restricted</p>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-amber-100">
                    {blockingReasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <Link
                      href="/portal/candidate"
                      className="inline-flex rounded-md border border-white/10 bg-[#08172C] px-3 py-2 text-sm text-[#D7DEEA] hover:bg-[#11233d]"
                    >
                      Return to Dashboard
                    </Link>
                  </div>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {errorMessage}
                </div>
              ) : null}

              {launchWarnings.length > 0 ? (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  {launchWarnings.map((warning) => (
                    <p key={warning}>• {warning}</p>
                  ))}
                </div>
              ) : null}

              <label className="mt-4 flex items-start gap-3 text-sm text-[#C3CDDA]">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-[#08172C] accent-[#5B7EA6]"
                />
                <span>
                  I acknowledge assessment controls, including fullscreen enforcement, focus monitoring, and audit logging.
                </span>
              </label>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!canProceed || !acknowledged || submitting}
                  onClick={() => {
                    void handleEnterSecureMode();
                  }}
                  className="rounded-md border border-[#5B7EA6]/60 bg-[#5B7EA6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6f93bd] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-[#64748B]"
                >
                  {submitting ? "Initializing Secure Mode..." : "Enter Secure Mode"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#D7DEEA] hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
