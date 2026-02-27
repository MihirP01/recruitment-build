import PortalShell, { PortalNavItem } from "@/components/portal/shared/PortalShell";
import { getAssessments, getCandidates, getResults } from "@/lib/data";
import { getClientPortalContext } from "@/lib/portal/client-context";

const navItems: PortalNavItem[] = [
  { id: "pipeline", label: "Candidate Pipeline", href: "/portal/client#pipeline", icon: "list-checks" },
  { id: "configuration", label: "Assessment Config", href: "/portal/client#configuration", icon: "clipboard-check" },
  { id: "results", label: "Results Review", href: "/portal/client#results", icon: "files" },
  { id: "audit", label: "Audit Visibility", href: "/portal/client#audit", icon: "shield-check" }
];

function candidateReference(candidateId: string) {
  const digits = candidateId.replace(/\D/g, "");
  const serial = (digits.slice(-5) || "10001").padStart(5, "0");
  return `CTRL-CND-${serial}`;
}

export default async function PortalClientPage() {
  const portalContext = await getClientPortalContext();
  const [candidates, assessments, results] = await Promise.all([getCandidates(), getAssessments(), getResults()]);
  const tenantClientId = portalContext.tenant === "nhs" ? "nhs" : "met";

  const clientCandidates = candidates.filter((candidate) => candidate.clientId === tenantClientId);
  const clientCandidateIds = new Set(clientCandidates.map((candidate) => candidate.id));
  const clientAssessments = assessments.filter((assessment) => assessment.clientId === tenantClientId);
  const clientResults = results.filter((result) => clientCandidateIds.has(result.candidateId));

  const pipeline = clientCandidates.map((candidate) => {
    const candidateAssessment =
      clientAssessments.find((assessment) => assessment.candidateId === candidate.id && assessment.status !== "Completed") ??
      clientAssessments.find((assessment) => assessment.candidateId === candidate.id) ??
      null;

    const candidateResult = candidateAssessment
      ? clientResults.find(
          (result) => result.candidateId === candidate.id && result.assessmentId === candidateAssessment.id
        )
      : null;

    return {
      candidate: candidateReference(candidate.id),
      stage: candidateAssessment?.status ?? "Not Assigned",
      score: candidateResult ? String(candidateResult.score) : "--",
      status:
        candidateAssessment?.status === "Completed"
          ? "Ready for Client"
          : candidateAssessment?.status === "In Progress"
            ? "In Progress"
            : candidateAssessment?.status === "Pending"
              ? "Pending Candidate"
              : candidateAssessment?.status === "Expired"
                ? "Expired"
                : "No Active Assessment"
    };
  });

  const configuration = [
    `${clientCandidates.length} candidate profiles are currently assigned to this client tenant.`,
    `${clientAssessments.filter((assessment) => assessment.status !== "Completed" && assessment.status !== "Expired").length} active assessments are awaiting completion.`,
    `${clientResults.length} scored submissions are available for review and governance checks.`
  ];

  const resultSummaries = clientResults.map((result) => ({
    ref: candidateReference(result.candidateId),
    summary: `Assessment ${result.assessmentId} scored ${result.score} with integrity ${result.integrityScore}.`
  }));

  const auditVisibility = [
    { event: "Candidate profile viewed", actor: portalContext.clientName, timestamp: "Today 10:12" },
    { event: "Assessment summary exported", actor: portalContext.clientName, timestamp: "Today 09:48" },
    { event: "Recruiter note acknowledged", actor: portalContext.clientName, timestamp: "Today 09:21" }
  ];

  return (
    <PortalShell
      role="client"
      tenant={portalContext.tenant}
      portalLabel="Client Portal"
      sectionTitle="Client Operations"
      sectionDescription="Candidate pipeline, assessment configuration, results review, and audit trace visibility for your organisation."
      userName={portalContext.clientName}
      userEmail={portalContext.clientEmail}
      referenceLabel="Client ID"
      referenceValue={portalContext.clientId}
      lastLogin={portalContext.lastLogin}
      navItems={navItems}
      activeNav="pipeline"
    >
      <section id="pipeline" className="rounded-xl border bg-[#0B1220] p-4" style={{ borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)" }}>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Candidate Pipeline</p>
        <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-3">
          {pipeline.length > 0 ? (
            pipeline.map((item) => (
              <article key={item.candidate} className="rounded-lg border border-white/10 bg-[#08172C] p-3">
                <p className="text-sm font-semibold text-[#E5E7EB]">{item.candidate}</p>
                <p className="mt-1 text-xs text-[#9CA3AF]">Stage: {item.stage}</p>
                <p className="text-xs text-[#9CA3AF]">Score: {item.score}</p>
                <p className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-[#C3CDDA]">{item.status}</p>
              </article>
            ))
          ) : (
            <article className="rounded-lg border border-white/10 bg-[#08172C] p-3 text-sm text-[#9CA3AF] md:col-span-3">
              No candidate profiles are currently linked to this client tenant.
            </article>
          )}
        </div>
      </section>

      <section id="configuration" className="rounded-xl border bg-[#0B1220] p-4" style={{ borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)" }}>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Assessment Configuration</p>
        <ul className="mt-3 space-y-2 text-sm text-[#9CA3AF]">
          {configuration.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </section>

      <section id="results" className="rounded-xl border bg-[#0B1220] p-4" style={{ borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)" }}>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Results Review</p>
        <div className="mt-3 space-y-2">
          {resultSummaries.length > 0 ? (
            resultSummaries.map((item) => (
              <article key={`${item.ref}-${item.summary}`} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                <p className="text-sm font-medium text-[#E5E7EB]">{item.ref}</p>
                <p className="mt-1 text-sm text-[#9CA3AF]">{item.summary}</p>
              </article>
            ))
          ) : (
            <article className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2 text-sm text-[#9CA3AF]">
              No completed results are available for client review.
            </article>
          )}
        </div>
      </section>

      <section id="audit" className="rounded-xl border bg-[#0B1220] p-4" style={{ borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)" }}>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Audit Visibility</p>
        <ul className="mt-3 space-y-2">
          {auditVisibility.map((entry) => (
            <li key={`${entry.event}-${entry.timestamp}`} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
              <p className="text-sm font-medium text-[#E5E7EB]">{entry.event}</p>
              <p className="text-xs text-[#9CA3AF]">{entry.actor}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6E8098]">{entry.timestamp}</p>
            </li>
          ))}
        </ul>
      </section>
    </PortalShell>
  );
}
