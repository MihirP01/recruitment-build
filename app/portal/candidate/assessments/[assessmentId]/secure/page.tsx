import { notFound } from "next/navigation";
import WpmSecureRuntime from "@/components/assessments/secure/WpmSecureRuntime";
import { getAssessmentById } from "@/lib/data";
import { getCandidatePortalContext } from "@/lib/portal/candidate-context";

type CandidateSecureAssessmentPageProps = {
  params: {
    assessmentId: string;
  };
};

export default async function CandidateSecureAssessmentPage({ params }: CandidateSecureAssessmentPageProps) {
  const portalContext = await getCandidatePortalContext();
  const assessment = await getAssessmentById(params.assessmentId);

  if (!assessment) {
    notFound();
  }

  return (
    <WpmSecureRuntime
      assessmentId={assessment.id}
      assessmentName={assessment.name}
      candidateId={portalContext.candidateId}
      candidateName={portalContext.candidateName}
    />
  );
}
