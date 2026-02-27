import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function RecruiterCodesPage() {
  const session = await requireRole([Role.RECRUITER]);

  const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: session.user.id } });
  const codes = await prisma.accessCode.findMany({
    where: { recruiterId: recruiterProfile?.id },
    include: {
      candidate: {
        include: {
          user: true,
          candidateAssessments: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      },
      assignedAssessment: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Generated Access Codes</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">Code Hash</th>
              <th className="px-3 py-2">Assessment</th>
              <th className="px-3 py-2">Expires</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Candidate</th>
              <th className="px-3 py-2">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {codes.map((code) => (
              <tr key={code.id}>
                <td className="px-3 py-2 font-mono text-xs">{code.codeHash.slice(0, 14)}...</td>
                <td className="px-3 py-2">{code.assignedAssessment?.title ?? "N/A"}</td>
                <td className="px-3 py-2">{code.expiresAt.toLocaleString()}</td>
                <td className="px-3 py-2">{code.isUsed ? "Used" : "Pending"}</td>
                <td className="px-3 py-2">{code.candidate?.user.email ?? "-"}</td>
                <td className="px-3 py-2">{code.candidate?.candidateAssessments[0]?.score ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
