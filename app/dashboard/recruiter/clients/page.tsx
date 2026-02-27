import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function RecruiterClientsPage() {
  await requireRole([Role.RECRUITER]);

  const clients = await prisma.user.findMany({
    where: { role: Role.CLIENT, deletedAt: null },
    include: {
      sharedCandidates: {
        include: {
          user: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Client Directory</h2>
      {clients.map((client) => (
        <div key={client.id} className="rounded-xl border border-slate-200 p-4">
          <p className="font-medium">{client.email}</p>
          <p className="text-sm text-slate-600">Shared Candidates: {client.sharedCandidates.length}</p>
        </div>
      ))}
    </div>
  );
}
