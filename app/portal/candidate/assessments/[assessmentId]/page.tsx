import { notFound } from "next/navigation";
import AssessmentEnvironmentGate from "@/components/assessments/AssessmentEnvironmentGate";
import CandidatePortalLayout from "@/components/portal/candidate/CandidatePortalLayout";
import { getAssessmentById } from "@/lib/data";
import { getCandidatePortalContext } from "@/lib/portal/candidate-context";

type CandidateAssessmentDetailPageProps = {
  params: {
    assessmentId: string;
  };
};

export default async function CandidateAssessmentDetailPage({ params }: CandidateAssessmentDetailPageProps) {
  const portalContext = await getCandidatePortalContext();
  const assessment = await getAssessmentById(params.assessmentId);

  if (!assessment) {
    notFound();
  }

  return (
    <CandidatePortalLayout
      {...portalContext}
      activeNav="assessments"
      sectionTitle={assessment.name}
      sectionDescription="Controlled assessment launch workflow with preflight environment validation and secure mode session controls."
    >
      <section className="rounded-xl border border-white/10 bg-[#0B1220] p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Assessment Overview</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-white/10 bg-[#08172C] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Category</p>
            <p className="mt-1 text-sm font-medium text-[#E5E7EB]">{assessment.category}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Status</p>
            <p className="mt-1 text-sm font-medium text-[#E5E7EB]">{assessment.status}</p>
          </article>
          <article className="rounded-lg border border-white/10 bg-[#08172C] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Deadline</p>
            <p className="mt-1 text-sm font-medium text-[#E5E7EB]">{assessment.deadline}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#8FA1B8]">Estimated Duration</p>
            <p className="mt-1 text-sm font-medium text-[#E5E7EB]">{assessment.duration}</p>
          </article>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#0B1220] p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Integrity Requirements</p>
        <ul className="mt-3 space-y-1 text-sm text-[#C3CDDA]">
          {assessment.integrityRequirements.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Device Eligibility</p>
        <ul className="mt-2 space-y-1 text-sm text-[#C3CDDA]">
          {assessment.deviceEligibility.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>

      <AssessmentEnvironmentGate assessment={assessment} />
    </CandidatePortalLayout>
  );
}
