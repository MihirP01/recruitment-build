import CandidatePortalLayout from "@/components/portal/candidate/CandidatePortalLayout";
import { getCandidatePortalContext } from "@/lib/portal/candidate-context";

const documentOverview = [
  {
    label: "Identity Verification",
    status: "Verified",
    updatedAt: "08 May 2026"
  },
  {
    label: "Candidate CV",
    status: "Uploaded",
    updatedAt: "08 May 2026"
  },
  {
    label: "Assessment Consent",
    status: "Accepted",
    updatedAt: "08 May 2026"
  }
];

export default async function CandidateAccountPage() {
  const portalContext = await getCandidatePortalContext();

  return (
    <CandidatePortalLayout
      {...portalContext}
      activeNav="account"
      sectionTitle="Account"
      sectionDescription="Candidate profile and document record view for recruitment workflow tracking."
    >
      <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <article className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Profile</p>
          <dl className="mt-4 grid min-w-0 gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-[#08172C] p-3">
              <dt className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Candidate Name</dt>
              <dd className="mt-1 text-[#E5E7EB]">{portalContext.candidateName}</dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#08172C] p-3">
              <dt className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Candidate ID</dt>
              <dd className="mt-1 text-[#E5E7EB]">{portalContext.candidateId}</dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#08172C] p-3 md:col-span-2">
              <dt className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Email</dt>
              <dd className="mt-1 text-[#E5E7EB]">{portalContext.candidateEmail}</dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#08172C] p-3 md:col-span-2">
              <dt className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Last Login</dt>
              <dd className="mt-1 text-[#E5E7EB]">{portalContext.lastLogin}</dd>
            </div>
          </dl>
        </article>

        <aside className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Document Overview</p>
          <ul className="mt-4 space-y-2">
            {documentOverview.map((item) => (
              <li key={item.label} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                <p className="text-sm font-medium text-[#E5E7EB]">{item.label}</p>
                <p className="mt-1 text-xs text-[#9CA3AF]">Status: {item.status}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Updated {item.updatedAt}</p>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </CandidatePortalLayout>
  );
}
