import { Role } from "@prisma/client";
import { RecruiterShareForm } from "@/components/dashboard/recruiter-share-form";
import { CvViewButton } from "@/components/dashboard/cv-view-button";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function RecruiterCandidatesPage() {
  const session = await requireRole([Role.RECRUITER]);

  const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: session.user.id } });

  const [candidates, clients] = await Promise.all([
    prisma.candidateProfile.findMany({
      where: { recruiterId: recruiterProfile?.id },
      include: {
        user: true,
        candidateAssessments: {
          include: {
            answers: {
              include: {
                question: {
                  select: {
                    questionText: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findMany({ where: { role: Role.CLIENT, deletedAt: null }, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Recruiter Candidates</h2>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="rounded-xl border border-slate-200 p-4">
              <p className="font-medium">{candidate.user.email}</p>
              <p className="text-sm text-slate-600">Status: {candidate.status}</p>
              <p className="text-sm text-slate-600">Latest Score: {candidate.candidateAssessments[0]?.score ?? "Not submitted"}</p>
              <p className="text-sm text-slate-600">Completed At: {candidate.candidateAssessments[0]?.completedAt?.toLocaleString() ?? "-"}</p>
              {candidate.cvStorageKey || candidate.cvUrl ? <CvViewButton candidateId={candidate.id} /> : <p className="text-xs text-slate-500">No CV uploaded</p>}
              {candidate.candidateAssessments[0]?.answers.length ? (
                <div className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                  {candidate.candidateAssessments[0].answers.map((answer) => (
                    <p key={answer.id}>
                      Q: {answer.question.questionText} | Selected: {answer.selectedAnswer}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <RecruiterShareForm
          candidates={candidates.map((c) => ({ id: c.id, label: `${c.user.email} (${c.status})` }))}
          clients={clients.map((c) => ({ id: c.id, label: c.email }))}
        />
      </div>
    </div>
  );
}
