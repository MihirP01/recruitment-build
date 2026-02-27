"use client";

import Link from "next/link";
import AssessmentEnvironmentRestrictionPanel from "@/components/assessments/AssessmentEnvironmentRestrictionPanel";
import { PortalAssessmentCard } from "@/lib/data/types";
import { useAssessmentEnvironment } from "@/lib/hooks/useAssessmentEnvironment";

function statusClass(status: PortalAssessmentCard["status"]) {
  if (status === "Completed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
  if (status === "In Progress") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }
  if (status === "Pending") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }
  return "border-rose-500/30 bg-rose-500/10 text-rose-300";
}

function requiresEnvironmentValidation(actionLabel: PortalAssessmentCard["actionLabel"]) {
  return actionLabel === "Start Assessment" || actionLabel === "Resume";
}

type CandidateAssessmentCardsProps = {
  assessments: PortalAssessmentCard[];
};

export default function CandidateAssessmentCards({ assessments }: CandidateAssessmentCardsProps) {
  const environment = useAssessmentEnvironment();

  const tenantCardStyle = {
    borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)"
  } as const;

  const roleActionStyle = {
    borderColor: "rgb(var(--role-accent-rgb) / 0.6)",
    backgroundColor: "rgb(var(--role-accent-rgb) / 0.82)"
  } as const;

  return (
    <div className="space-y-5">
      {!environment.ready ? (
        <div className="rounded-lg border border-white/10 bg-[#0B1220] px-4 py-3 text-sm text-[#9CA3AF]">
          Validating assessment launch environment...
        </div>
      ) : null}

      {environment.ready && !environment.valid ? (
        <AssessmentEnvironmentRestrictionPanel
          title="Assessment Launch Restricted"
          reasons={environment.reasons}
        />
      ) : null}

      {environment.warnings.length > 0 ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-medium text-amber-200">Environment Warnings</p>
          <ul className="mt-1 space-y-1">
            {environment.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {assessments.map((assessment) => {
          const needsValidatedEnvironment = requiresEnvironmentValidation(assessment.actionLabel);
          const launchRestrictedByEnvironment = needsValidatedEnvironment && environment.ready && !environment.valid;

          return (
            <article key={assessment.id} className="min-w-0 rounded-xl border bg-[#0B1220] p-4" style={tenantCardStyle}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#E5E7EB]">{assessment.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">{assessment.category}</p>
                </div>
                <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(assessment.status)}`}>
                  {assessment.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#9CA3AF]">
                <p>
                  <span className="block text-[#6E8098]">Assigned</span>
                  {assessment.assignedDate}
                </p>
                <p>
                  <span className="block text-[#6E8098]">Deadline</span>
                  {assessment.deadline}
                </p>
                <p>
                  <span className="block text-[#6E8098]">Countdown</span>
                  {assessment.deadlineCountdown}
                </p>
                <p>
                  <span className="block text-[#6E8098]">Duration</span>
                  {assessment.duration}
                </p>
              </div>

              <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-[#08172C] p-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Integrity Requirements</p>
                  <ul className="mt-1 space-y-1 text-sm text-[#C3CDDA]">
                    {assessment.integrityRequirements.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Device Eligibility</p>
                  <ul className="mt-1 space-y-1 text-sm text-[#C3CDDA]">
                    {assessment.deviceEligibility.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                {assessment.actionHref ? (
                  <div className="space-y-2">
                    <Link
                      href={assessment.actionHref}
                      className="inline-flex w-full justify-center rounded-md border px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={roleActionStyle}
                    >
                      {assessment.actionLabel}
                    </Link>
                    {launchRestrictedByEnvironment ? (
                      <p className="text-xs text-amber-200">Environment restrictions detected. Open to review secure launch requirements.</p>
                    ) : null}
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#64748B]"
                  >
                    {assessment.actionLabel}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {assessments.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0B1220] p-5 text-sm text-[#9CA3AF]">
          No assessments are currently assigned.
        </div>
      ) : null}
    </div>
  );
}
