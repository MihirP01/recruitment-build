type CanvasFocus =
  | "hero"
  | "about"
  | "features"
  | "security"
  | "intelligence"
  | "testimonials"
  | "contact";

type CanvasConfig = {
  treeOpacity: number;
  workflowOpacity: number;
  auditOpacity: number;
  activeTreeIndex: number;
  activeWorkflowIndex: number;
  activeLogIndex: number;
  activityLow: boolean;
  shiftX: number;
  shiftY: number;
};

const ROLE_TREE = ["Recruiter", "Candidate", "Client", "Admin"];
const WORKFLOW_STEPS = [
  "Access Code Issued",
  "Candidate Registered",
  "Assessment Completed",
  "Review Approved",
  "Shared to Client"
];

const AUDIT_LOGS = [
  { time: "09:41:08", role: "RECRUITER", action: "ACCESS_CODE_CREATED", status: "OK" },
  { time: "09:47:21", role: "CANDIDATE", action: "REGISTERED", status: "OK" },
  { time: "10:06:12", role: "CANDIDATE", action: "ASSESSMENT_SUBMITTED", status: "OK" },
  { time: "10:14:45", role: "RECRUITER", action: "REVIEW_APPROVED", status: "OK" },
  { time: "10:22:03", role: "CLIENT", action: "CV_LINK_ACCESSED", status: "OK" }
];

const FOCUS_CONFIG: Record<CanvasFocus, CanvasConfig> = {
  hero: {
    treeOpacity: 1,
    workflowOpacity: 1,
    auditOpacity: 1,
    activeTreeIndex: 0,
    activeWorkflowIndex: 1,
    activeLogIndex: 1,
    activityLow: false,
    shiftX: 0,
    shiftY: 0
  },
  about: {
    treeOpacity: 0.7,
    workflowOpacity: 1,
    auditOpacity: 0.72,
    activeTreeIndex: 1,
    activeWorkflowIndex: 2,
    activeLogIndex: 2,
    activityLow: false,
    shiftX: 6,
    shiftY: -4
  },
  features: {
    treeOpacity: 0.78,
    workflowOpacity: 1,
    auditOpacity: 0.78,
    activeTreeIndex: 0,
    activeWorkflowIndex: 2,
    activeLogIndex: 2,
    activityLow: false,
    shiftX: 4,
    shiftY: -3
  },
  security: {
    treeOpacity: 1,
    workflowOpacity: 0.8,
    auditOpacity: 1,
    activeTreeIndex: 3,
    activeWorkflowIndex: 3,
    activeLogIndex: 3,
    activityLow: false,
    shiftX: -6,
    shiftY: -2
  },
  intelligence: {
    treeOpacity: 0.75,
    workflowOpacity: 1,
    auditOpacity: 0.82,
    activeTreeIndex: 2,
    activeWorkflowIndex: 4,
    activeLogIndex: 4,
    activityLow: false,
    shiftX: 4,
    shiftY: -6
  },
  testimonials: {
    treeOpacity: 0.82,
    workflowOpacity: 0.72,
    auditOpacity: 1,
    activeTreeIndex: 2,
    activeWorkflowIndex: 4,
    activeLogIndex: 4,
    activityLow: false,
    shiftX: -3,
    shiftY: -4
  },
  contact: {
    treeOpacity: 0.55,
    workflowOpacity: 0.62,
    auditOpacity: 0.56,
    activeTreeIndex: 0,
    activeWorkflowIndex: 0,
    activeLogIndex: 0,
    activityLow: true,
    shiftX: 0,
    shiftY: 0
  }
};

function statusClass(status: string): string {
  return status === "OK"
    ? "border-[rgb(var(--color-accent-rgb)/0.5)] bg-[rgb(var(--color-accent-rgb)/0.2)] text-[var(--color-text-secondary)]"
    : "border-[#664247]/50 bg-[#2f1a1e] text-[#d0a2a8]";
}

export default function SystemCanvas({ focus }: { focus: CanvasFocus }) {
  const cfg = FOCUS_CONFIG[focus];

  return (
    <div
      className={`system-canvas-breathe relative h-auto min-h-[360px] w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 transition-[opacity,transform] duration-300 ease-in-out sm:h-[420px] sm:p-5 ${
        cfg.activityLow ? "opacity-90" : "opacity-100"
      }`}
      style={{ transform: `translate(${cfg.shiftX}px, ${cfg.shiftY}px)` }}
    >
      <div className="absolute inset-0 opacity-100" style={{ backgroundImage: "linear-gradient(rgba(156,163,175,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(156,163,175,0.02) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

      <div className="relative grid h-full grid-cols-1 gap-5 text-[var(--color-text-primary)] md:grid-cols-[0.9fr_1fr_1.25fr] md:gap-4">
        <div className="relative transition-opacity duration-300 ease-in-out" style={{ opacity: cfg.treeOpacity }}>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Access Tree</p>
          <ul className="relative mt-4 space-y-4 border-l border-[var(--color-border)] pl-4">
            {ROLE_TREE.map((role, idx) => (
              <li key={role} className="relative pl-3 text-sm">
                <span
                  className={`absolute -left-[1.15rem] top-[0.45rem] h-2.5 w-2.5 rounded-full border border-[rgb(var(--color-accent-rgb)/0.45)] ${
                    idx === cfg.activeTreeIndex ? "animate-system-pulse bg-[var(--color-accent)]" : "bg-[var(--color-accent-surface)]"
                  }`}
                  style={{ animationDelay: `${idx * 120}ms` }}
                />
                <span className="text-[var(--color-text-primary)]">{role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative transition-opacity duration-300 ease-in-out" style={{ opacity: cfg.workflowOpacity }}>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Workflow</p>
          <ul className="relative mt-4 space-y-3">
            {WORKFLOW_STEPS.map((step, idx) => (
              <li
                key={step}
                className={`relative rounded-md border py-2 pl-6 pr-3 text-[13px] transition-colors duration-300 ease-in-out md:ml-6 md:before:absolute md:before:left-[-24px] md:before:top-1/2 md:before:h-px md:before:w-5 md:before:-translate-y-1/2 md:before:bg-[rgb(var(--color-accent-rgb)/0.45)] ${
                  idx === cfg.activeWorkflowIndex
                    ? "border-[rgb(var(--color-accent-rgb)/0.55)] bg-[rgb(var(--color-accent-rgb)/0.22)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface-1)]"
                }`}
              >
                <span
                  className={`absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full md:left-0 ${
                    idx <= cfg.activeWorkflowIndex ? "animate-system-pulse bg-[var(--color-accent)]" : "bg-[rgb(var(--color-accent-rgb)/0.45)]"
                  }`}
                  style={{ animationDelay: `${idx * 90}ms` }}
                />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative transition-opacity duration-300 ease-in-out" style={{ opacity: cfg.auditOpacity }}>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Audit Stream</p>
          <ul className="mt-4 space-y-2 pr-1 md:pr-0">
            {AUDIT_LOGS.map((log, idx) => (
              <li
                key={`${log.time}-${log.action}`}
                className={`rounded-md border border-[var(--color-border)] bg-[var(--color-surface-1)] px-3 py-2 transition-opacity duration-300 ease-in-out ${
                  idx === cfg.activeLogIndex && !cfg.activityLow ? "animate-system-log-entry" : ""
                }`}
                style={{ animationDelay: `${idx * 140}ms` }}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--color-text-muted)]">
                  <span className="font-mono tabular-nums">{log.time}</span>
                  <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] tracking-wide">{log.role}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-[12px] text-[var(--color-text-primary)]">
                  <span className="truncate font-mono text-[11px] tracking-[0.01em]">{log.action}</span>
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] ${statusClass(log.status)}`}>{log.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
