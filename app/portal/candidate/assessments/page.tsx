import CandidateAssessmentCards from "@/components/portal/candidate/CandidateAssessmentCards";
import CandidatePortalLayout from "@/components/portal/candidate/CandidatePortalLayout";
import { getAssessmentsForCandidateEmail } from "@/lib/data";
import { getCandidatePortalContext } from "@/lib/portal/candidate-context";

export default async function CandidateAssessmentsPage() {
  const portalContext = await getCandidatePortalContext();
  const assessments = await getAssessmentsForCandidateEmail(portalContext.candidateEmail);

  return (
    <CandidatePortalLayout
      {...portalContext}
      activeNav="assessments"
      sectionTitle="My Assessments"
      sectionDescription="Assessment launch and progression are controlled by environment validation, deadline policy, and integrity monitoring."
    >
      <CandidateAssessmentCards assessments={assessments} />
    </CandidatePortalLayout>
  );
}
