import { AlertTriangle, ShieldAlert } from "lucide-react";
import { AssessmentEnvironmentChecks } from "@/lib/security/assessment-environment";

type AssessmentEnvironmentRestrictionPanelProps = {
  reasons: string[];
  checks?: AssessmentEnvironmentChecks;
  title?: string;
};

export default function AssessmentEnvironmentRestrictionPanel({
  reasons,
  title = "Assessment Launch Restricted"
}: AssessmentEnvironmentRestrictionPanelProps) {
  return (
    <section className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-amber-200">{title}</h3>
          <p className="mt-1 text-sm text-amber-100/90">
            Portal access remains available. Assessment execution is disabled until environment requirements are met.
          </p>
        </div>
      </div>

      {reasons.length > 0 ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-[#08172C] p-3">
          <div className="mb-2 flex items-center gap-2 text-[#D7DEEA]">
            <ShieldAlert className="h-4 w-4 text-amber-300" />
            <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Restriction Detail</p>
          </div>
          <ul className="space-y-1 text-sm text-[#C3CDDA]">
            {reasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
