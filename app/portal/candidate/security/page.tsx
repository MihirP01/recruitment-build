import CandidatePortalLayout from "@/components/portal/candidate/CandidatePortalLayout";
import { getCandidatePortalContext } from "@/lib/portal/candidate-context";
import {
  activeSessions,
  activityTimeline,
  approvedDevices,
  consentAgreements
} from "@/lib/portal/candidate-data";

export default async function CandidateSecurityPage() {
  const portalContext = await getCandidatePortalContext();

  return (
    <CandidatePortalLayout
      {...portalContext}
      activeNav="security"
      sectionTitle="Security & Consent"
      sectionDescription="Compliance visibility across active sessions, approved devices, audit records, and signed consent agreements."
    >
      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <article className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Active Sessions</p>
          <ul className="mt-4 space-y-2">
            {activeSessions.map((session) => (
              <li key={session.id} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#E5E7EB]">{session.device}</p>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                      session.status === "Active"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-white/15 bg-white/5 text-[#9CA3AF]"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#9CA3AF]">{session.location}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Last seen {session.lastSeen}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Approved Devices</p>
          <ul className="mt-4 space-y-2">
            {approvedDevices.map((device) => (
              <li key={device.id} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                <p className="text-sm font-medium text-[#E5E7EB]">{device.label}</p>
                <p className="mt-1 text-xs text-[#9CA3AF]">{device.platform}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Enrolled {device.enrolledAt}</p>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                      device.compliance === "Compliant"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {device.compliance}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <article className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Audit Logs</p>
          <ul className="mt-4 space-y-2">
            {activityTimeline.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                <p className="text-sm font-medium text-[#E5E7EB]">{entry.event}</p>
                <p className="text-xs text-[#9CA3AF]">{entry.detail}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6E8098]">{entry.timestamp}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Consent Agreements</p>
          <ul className="mt-4 space-y-2">
            {consentAgreements.map((agreement) => (
              <li key={agreement.id} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                <p className="text-sm font-medium text-[#E5E7EB]">{agreement.name}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">{agreement.acceptedAt}</p>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                      agreement.status === "Accepted"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {agreement.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </CandidatePortalLayout>
  );
}
