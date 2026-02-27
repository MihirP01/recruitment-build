import CandidatePortalLayout from "@/components/portal/candidate/CandidatePortalLayout";
import { getCandidatePortalContext } from "@/lib/portal/candidate-context";

const instructionSections = [
  {
    title: "Assessment Rules",
    points: [
      "Complete each assigned assessment within its active deadline window.",
      "Assessments must be completed independently without external assistance.",
      "Only one active attempt is permitted unless formally approved by recruitment operations."
    ]
  },
  {
    title: "Environment Requirements",
    points: [
      "Use a desktop or laptop with a compliant browser configuration.",
      "Touch-only devices and restricted viewport sizes are blocked from launch.",
      "Maintain stable connectivity for uninterrupted submission and audit recording."
    ]
  },
  {
    title: "Disqualification Policy",
    points: [
      "Confirmed integrity violations may invalidate current and future assessment attempts.",
      "Repeated environment bypass attempts trigger manual compliance review.",
      "Deadline breaches can remove assessments from recruiter review workflow."
    ]
  },
  {
    title: "Technical Setup",
    points: [
      "Disable browser extensions that alter form input behavior.",
      "Permit secure cookies and JavaScript execution for session continuity.",
      "Ensure managed device clock and timezone are synchronized."
    ]
  }
];

export default async function CandidateInstructionsPage() {
  const portalContext = await getCandidatePortalContext();

  return (
    <CandidatePortalLayout
      {...portalContext}
      activeNav="instructions"
      sectionTitle="Instructions"
      sectionDescription="Reference guidance for assessment execution, environment compliance, and disqualification thresholds."
    >
      <section className="grid min-w-0 gap-4 md:grid-cols-2">
        {instructionSections.map((section) => (
          <article key={section.title} className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
            <p className="text-sm font-semibold text-[#E5E7EB]">{section.title}</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#9CA3AF]">
              {section.points.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </CandidatePortalLayout>
  );
}
