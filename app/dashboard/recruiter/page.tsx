import { Role } from "@prisma/client";
import { RecruiterCodeGenerator } from "@/components/dashboard/recruiter-code-generator";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function RecruiterDashboardPage() {
  const session = await requireRole([Role.RECRUITER]);

  const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: session.user.id } });

  const [assessments, candidateCount, completedCount, sharedCount] = await Promise.all([
    prisma.assessment.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.candidateProfile.count({ where: { recruiterId: recruiterProfile?.id } }),
    prisma.candidateProfile.count({ where: { recruiterId: recruiterProfile?.id, status: "COMPLETED" } }),
    prisma.candidateProfile.count({ where: { recruiterId: recruiterProfile?.id, status: "SHARED" } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Recruiter Overview</h2>
        <p className="mt-1 text-sm text-slate-600">Generate candidate codes and track hiring pipeline progress.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">Total Candidates</p><p className="text-2xl font-semibold">{candidateCount}</p></div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">Completed</p><p className="text-2xl font-semibold">{completedCount}</p></div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">Shared</p><p className="text-2xl font-semibold">{sharedCount}</p></div>
      </div>

      <RecruiterCodeGenerator assessments={assessments} />
    </div>
  );
}
