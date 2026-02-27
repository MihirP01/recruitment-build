"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  ClipboardList,
  Clock3,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  UserCog
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AssessmentEnvironmentRestrictionPanel from "@/components/assessments/AssessmentEnvironmentRestrictionPanel";
import AnimatedMenuButton from "@/components/ui/AnimatedMenuButton";
import { PORTAL_PREVIEW_COOKIE } from "@/lib/auth/preview";
import { useAssessmentEnvironment } from "@/lib/hooks/useAssessmentEnvironment";

type CandidatePortalConsoleProps = {
  candidateName: string;
  candidateEmail: string;
  candidateId: string;
  lastLogin: string;
};

type AssessmentStatus = "Completed" | "Pending" | "In Progress" | "Expired";

type AssessmentRecord = {
  id: string;
  name: string;
  category: string;
  status: AssessmentStatus;
  assignedDate: string;
  deadline: string;
  duration: string;
  actionLabel: "Start Assessment" | "Resume" | "View Result" | "Unavailable";
  actionHref?: string;
};

type ActivityEntry = {
  id: string;
  event: string;
  detail: string;
  timestamp: string;
};

const assessments: AssessmentRecord[] = [
  {
    id: "typing-speed",
    name: "Typing Speed Assessment (WPM Test)",
    category: "Communication",
    status: "Pending",
    assignedDate: "08 May 2026",
    deadline: "12 May 2026",
    duration: "10 minutes",
    actionLabel: "Start Assessment",
    actionHref: "/portal/candidate/assessments/wpm"
  },
  {
    id: "situational-judgement",
    name: "Situational Judgement Test",
    category: "Decision Making",
    status: "In Progress",
    assignedDate: "09 May 2026",
    deadline: "15 May 2026",
    duration: "25 minutes",
    actionLabel: "Resume"
  },
  {
    id: "incident-report",
    name: "Incident Report Writing",
    category: "Written Communication",
    status: "Completed",
    assignedDate: "27 Apr 2026",
    deadline: "03 May 2026",
    duration: "30 minutes",
    actionLabel: "View Result"
  },
  {
    id: "public-order-briefing",
    name: "Public Order Briefing Response",
    category: "Operational Communication",
    status: "Pending",
    assignedDate: "11 May 2026",
    deadline: "20 May 2026",
    duration: "18 minutes",
    actionLabel: "Start Assessment"
  },
  {
    id: "legacy-ethics",
    name: "Legacy Ethics Scenario",
    category: "Professional Standards",
    status: "Expired",
    assignedDate: "10 Apr 2026",
    deadline: "18 Apr 2026",
    duration: "20 minutes",
    actionLabel: "Unavailable"
  }
];

const activityLog: ActivityEntry[] = [
  {
    id: "a-1",
    event: "Assessment Opened",
    detail: "Situational Judgement Test launch validated.",
    timestamp: "Today 09:21"
  },
  {
    id: "a-2",
    event: "Submission Recorded",
    detail: "Incident Report Writing marked complete.",
    timestamp: "Today 09:14"
  },
  {
    id: "a-3",
    event: "Session Verified",
    detail: "Secure session key refreshed successfully.",
    timestamp: "Today 09:11"
  },
  {
    id: "a-4",
    event: "Result Processed",
    detail: "Scoring engine output stored for review.",
    timestamp: "Today 08:52"
  }
];

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "assessments", label: "My Assessments", icon: ClipboardList },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "instructions", label: "Instructions", icon: FileText },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "account", label: "Account", icon: UserCog },
  { id: "security", label: "Security & Consent", icon: LockKeyhole }
] as const;

const reveal = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: "easeOut" }
} as const;

function statusClass(status: AssessmentStatus) {
  if (status === "Completed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]";
  }
  if (status === "In Progress") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]";
  }
  if (status === "Pending") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]";
  }
  return "border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-[0_0_0_1px_rgba(244,63,94,0.15)]";
}

export default function CandidatePortalConsole({
  candidateName,
  candidateEmail,
  candidateId,
  lastLogin
}: CandidatePortalConsoleProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<(typeof sidebarItems)[number]["id"]>("dashboard");
  const [launchingAssessmentId, setLaunchingAssessmentId] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState("");
  const environment = useAssessmentEnvironment();

  const summary = useMemo(() => {
    const assigned = assessments.length;
    const completed = assessments.filter((item) => item.status === "Completed").length;
    const pending = assessments.filter((item) => item.status === "Pending" || item.status === "In Progress").length;
    const expiringSoon = 1;

    return [
      { label: "Assigned Assessments", value: assigned },
      { label: "Completed", value: completed },
      { label: "Pending", value: pending },
      { label: "Expiring Soon", value: expiringSoon }
    ];
  }, []);

  const upcomingDeadlines = useMemo(
    () => [
      { name: "Typing Speed Assessment", expiresIn: "Expires in 2 Days", expired: false },
      { name: "Situational Judgement Test", expiresIn: "Expires in 5 Days", expired: false },
      { name: "Legacy Ethics Scenario", expiresIn: "Expired 23 Days Ago", expired: true }
    ],
    []
  );

  const handleSignOut = () => {
    document.cookie = `${PORTAL_PREVIEW_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileMenuOpen ? "hidden" : previousOverflow || "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const handleAssessmentLaunch = async (assessment: AssessmentRecord) => {
    if (!assessment.actionHref || !environment.payload || !environment.valid) {
      return;
    }

    setLaunchError("");
    setLaunchingAssessmentId(assessment.id);

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
        const detail = body.restriction?.reasons?.[0] ?? body.error ?? "Assessment launch was blocked by policy.";
        setLaunchError(detail);
        return;
      }

      router.push(assessment.actionHref);
    } catch {
      setLaunchError("Unable to initialize secure assessment launch. Please retry.");
    } finally {
      setLaunchingAssessmentId(null);
    }
  };

  const renderAssessmentAction = (assessment: AssessmentRecord, fullWidth = false) => {
    const widthClass = fullWidth ? "w-full justify-center" : "";
    const requiresValidatedEnvironment =
      assessment.actionLabel === "Start Assessment" || assessment.actionLabel === "Resume";
    const launchDisabledByEnvironment =
      requiresValidatedEnvironment && (!environment.ready || !environment.valid);

    if (assessment.actionHref && assessment.actionLabel !== "Unavailable" && requiresValidatedEnvironment) {
      return (
        <button
          type="button"
          onClick={() => {
            void handleAssessmentLaunch(assessment);
          }}
          disabled={launchDisabledByEnvironment || launchingAssessmentId === assessment.id}
          className={`inline-flex rounded-md border border-[#5B7EA6]/60 bg-[#5B7EA6] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#6f93bd] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-[#64748B] ${widthClass}`}
        >
          {launchingAssessmentId === assessment.id ? "Initializing..." : assessment.actionLabel}
        </button>
      );
    }

    if (assessment.actionHref && assessment.actionLabel !== "Unavailable") {
      return (
        <Link
          href={assessment.actionHref}
          className={`inline-flex rounded-md border border-[#5B7EA6]/60 bg-[#5B7EA6] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#6f93bd] ${widthClass}`}
        >
          {assessment.actionLabel}
        </Link>
      );
    }

    return (
      <button
        type="button"
        disabled={assessment.actionLabel === "Unavailable" || launchDisabledByEnvironment || !assessment.actionHref}
        className={`rounded-md border border-[#5B7EA6]/60 bg-[#5B7EA6] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#6f93bd] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-[#64748B] ${fullWidth ? "w-full" : ""}`}
      >
        {assessment.actionLabel}
      </button>
    );
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#0B1220] text-[#E5E7EB]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#020617]">
          <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              {!mobileMenuOpen ? (
                <div className="lg:hidden">
                  <AnimatedMenuButton
                    open={false}
                    onClick={() => setMobileMenuOpen(true)}
                    controlsId="candidate-mobile-nav"
                    openLabel="Close portal navigation"
                    closedLabel="Open portal navigation"
                  />
                </div>
              ) : null}
              <Image src="/brand/ctrl-shield.png" alt="CTRL Shield" width={24} height={28} className="h-6 w-auto sm:h-7" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-wide text-[#E5E7EB]">Candidate Portal</p>
                <p className="hidden text-xs text-[#8FA1B8] md:block">Operational Assessment Console</p>
              </div>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              <div className="text-right">
                <p className="text-sm font-medium text-[#E5E7EB]">{candidateName}</p>
                <p className="text-xs text-[#8FA1B8]">{candidateEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8FA1B8]">Candidate ID</p>
                <p className="text-sm font-medium text-[#D7DEEA]">{candidateId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8FA1B8]">Last Login</p>
                <p className="text-sm font-medium text-[#D7DEEA]">{lastLogin}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 sm:h-auto sm:w-auto sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs sm:font-medium sm:text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="hidden sm:inline">Secure Session</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-[#D7DEEA] transition-colors hover:bg-white/10 sm:px-3"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100dvh-72px)] overflow-hidden">
          <div className="mx-auto flex w-full max-w-[1600px] overflow-hidden">
            <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-[#020617] lg:block">
              <nav className="space-y-1 p-4">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveMenu(item.id)}
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "border border-[#5B7EA6]/40 bg-[#24364F]/60 text-[#E5E7EB]"
                          : "border border-transparent text-[#9CA3AF] hover:bg-white/5 hover:text-[#D7DEEA]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <AnimatePresence>
              {mobileMenuOpen ? (
                <div className="fixed inset-0 z-40 lg:hidden">
                <motion.button
                  type="button"
                  className="absolute inset-0 bg-black/60"
                  aria-label="Close navigation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                />
                <motion.aside
                  id="candidate-mobile-nav"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 w-64 border-r border-white/10 bg-[#020617] p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#E5E7EB]">Navigation</p>
                    <AnimatedMenuButton
                      open
                      size="sm"
                      onClick={() => setMobileMenuOpen(false)}
                      openLabel="Close portal navigation"
                      closedLabel="Open portal navigation"
                    />
                  </div>
                  <nav className="space-y-1">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      const active = activeMenu === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveMenu(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                            active
                              ? "border border-[#5B7EA6]/40 bg-[#24364F]/60 text-[#E5E7EB]"
                              : "border border-transparent text-[#9CA3AF] hover:bg-white/5 hover:text-[#D7DEEA]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </motion.aside>
                </div>
              ) : null}
            </AnimatePresence>

            <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
              <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
              {environment.ready && !environment.valid ? (
                <AssessmentEnvironmentRestrictionPanel reasons={environment.reasons} />
              ) : null}
              {launchError ? (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {launchError}
                </div>
              ) : null}

              <motion.section {...reveal} className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summary.map((item) => (
                  <article key={item.label} className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-[#E5E7EB]">{item.value}</p>
                  </article>
                ))}
              </motion.section>

              <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <motion.section {...reveal} transition={{ ...reveal.transition, delay: 0.04 }} className="min-w-0">
                  <div className="rounded-xl border border-white/10 bg-[#0B1220]">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <h2 className="text-sm font-semibold tracking-wide text-[#E5E7EB]">Active Assessments</h2>
                      <span className="text-xs text-[#8FA1B8]">Controlled candidate workflow</span>
                    </div>

                    <div className="hidden min-w-0 overflow-x-auto lg:block">
                      <table className="w-full text-sm">
                        <thead className="bg-[#0A1A32] text-left text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">
                          <tr>
                            <th className="px-4 py-3">Assessment Name</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Assigned Date</th>
                            <th className="px-4 py-3">Deadline</th>
                            <th className="px-4 py-3">Estimated Duration</th>
                            <th className="px-4 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assessments.map((assessment) => (
                            <tr key={assessment.id} className="border-t border-white/10 transition-colors hover:bg-white/[0.03]">
                              <td className="px-4 py-3 text-[#D7DEEA]">{assessment.name}</td>
                              <td className="px-4 py-3 text-[#9CA3AF]">{assessment.category}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(assessment.status)}`}>
                                  {assessment.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#9CA3AF]">{assessment.assignedDate}</td>
                              <td className="px-4 py-3 text-[#9CA3AF]">{assessment.deadline}</td>
                              <td className="px-4 py-3 text-[#9CA3AF]">{assessment.duration}</td>
                              <td className="px-4 py-3">{renderAssessmentAction(assessment)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-4 p-4 lg:hidden">
                      {assessments.map((assessment) => (
                        <article key={`card-${assessment.id}`} className="min-w-0 rounded-lg border border-white/10 bg-[#08172C] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#D7DEEA]">{assessment.name}</p>
                              <p className="mt-1 text-xs text-[#8FA1B8]">{assessment.category}</p>
                            </div>
                            <span className={`shrink-0 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(assessment.status)}`}>
                              {assessment.status}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#9CA3AF]">
                            <p>
                              <span className="block text-[#6E8098]">Assigned</span>
                              {assessment.assignedDate}
                            </p>
                            <p>
                              <span className="block text-[#6E8098]">Deadline</span>
                              {assessment.deadline}
                            </p>
                            <p>
                              <span className="block text-[#6E8098]">Duration</span>
                              {assessment.duration}
                            </p>
                          </div>

                          <div className="mt-4">
                            {renderAssessmentAction(assessment, true)}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </motion.section>

                <motion.aside {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className="min-w-0 space-y-4">
                  <section className="rounded-xl border border-white/10 bg-[#0B1220] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-[#8FA1B8]" />
                      <h3 className="text-sm font-semibold text-[#E5E7EB]">Upcoming Deadlines</h3>
                    </div>
                    <ul className="space-y-3">
                      {upcomingDeadlines.map((item) => (
                        <li key={item.name} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                          <p className="text-sm font-medium text-[#D7DEEA]">{item.name}</p>
                          <p className={`mt-1 text-xs ${item.expired ? "text-rose-300" : "text-amber-300"}`}>{item.expiresIn}</p>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-xl border border-white/10 bg-[#0B1220] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-[#8FA1B8]" />
                      <h3 className="text-sm font-semibold text-[#E5E7EB]">Important Notice</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-[#9CA3AF]">
                      All assessments must be completed independently. Activity is monitored and audited.
                    </p>
                  </section>
                </motion.aside>
              </div>

              <div className="grid min-w-0 gap-6 xl:grid-cols-2">
                <motion.section {...reveal} transition={{ ...reveal.transition, delay: 0.12 }} className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#8FA1B8]" />
                    <h3 className="text-sm font-semibold text-[#E5E7EB]">Instructions & Notices</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-[#9CA3AF]">
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                      Complete assessments before expiry windows to avoid invalidation.
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-blue-300" />
                      Session integrity checks run continuously during active assessments.
                    </li>
                    <li className="flex items-start gap-2">
                      <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-300" />
                      Submissions after deadline may be rejected from review processing.
                    </li>
                  </ul>
                </motion.section>

                <motion.section {...reveal} transition={{ ...reveal.transition, delay: 0.16 }} className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#8FA1B8]" />
                    <h3 className="text-sm font-semibold text-[#E5E7EB]">Recent Activity Log</h3>
                  </div>
                  <ul className="space-y-3">
                    {activityLog.map((entry) => (
                      <li key={entry.id} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                        <p className="text-sm font-medium text-[#D7DEEA]">{entry.event}</p>
                        <p className="text-xs text-[#9CA3AF]">{entry.detail}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6E8098]">{entry.timestamp}</p>
                      </li>
                    ))}
                  </ul>
                </motion.section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
