import ResetDevDataButton from "@/components/dev/ResetDevDataButton";
import PortalShell, { PortalNavItem } from "@/components/portal/shared/PortalShell";
import { getAdmins, getAssessments, getCandidates, getClients, getResults } from "@/lib/data";
import { IS_DEV } from "@/lib/env/isDev";
import { getAdminPortalContext } from "@/lib/portal/admin-context";

const navItems: PortalNavItem[] = [
  { id: "orgs", label: "Organisation List", href: "/portal/admin#orgs", icon: "building-2" },
  { id: "templates", label: "Template Library", href: "/portal/admin#templates", icon: "file-stack" },
  { id: "events", label: "Audit Events", href: "/portal/admin#events", icon: "shield-alert" },
  { id: "sessions", label: "Active Sessions", href: "/portal/admin#sessions", icon: "users" },
  { id: "alerts", label: "Integrity Alerts", href: "/portal/admin#alerts", icon: "alert-octagon" }
];

export default async function PortalAdminPage() {
  const portalContext = await getAdminPortalContext();
  const [admins, clients, candidates, assessments, results] = await Promise.all([
    getAdmins(),
    getClients(),
    getCandidates(),
    getAssessments(),
    getResults()
  ]);

  const organisations = clients.map((client) => ({
    name: client.name,
    code: client.id,
    candidates: candidates.filter((candidate) => candidate.clientId === client.id).length,
    status: "Active"
  }));

  const templates = assessments.map((assessment) => ({
    id: assessment.id,
    name: assessment.name,
    version: "v1.0",
    usage: `${results.filter((result) => result.assessmentId === assessment.id).length} recorded submissions`
  }));

  const platformEvents = [
    { event: "Tenant configuration reviewed", actor: "Admin Control", timestamp: "Today 09:45" },
    { event: "Assessment template synced", actor: "Admin Control", timestamp: "Today 09:03" },
    { event: "Client role entitlement updated", actor: "Admin Control", timestamp: "Today 08:56" }
  ];

  const activeSessions = [
    { session: "ADM-SESSION-71", user: admins[0]?.name ?? "Admin Supervisor", tenant: "global", status: "Active" },
    { session: "CLT-SESSION-14", user: clients[0]?.name ?? "Client Manager", tenant: clients[0]?.id ?? "met", status: "Active" },
    { session: "CND-SESSION-93", user: candidates[0]?.name ?? "Candidate User", tenant: candidates[0]?.clientId ?? "met", status: "Active" }
  ];

  const integrityAlerts = results
    .filter((result) => result.integrityScore < 80 || result.status === "Flagged")
    .map((result) => `Candidate ${result.candidateId} integrity score ${result.integrityScore} on ${result.assessmentId}.`);

  return (
    <PortalShell
      role="admin"
      tenant={portalContext.tenant}
      portalLabel="Admin Portal"
      sectionTitle="Platform Administration"
      sectionDescription="Multi-tenant governance for organisations, assessment templates, compliance events, and integrity controls."
      userName={portalContext.adminName}
      userEmail={portalContext.adminEmail}
      referenceLabel="Admin ID"
      referenceValue={portalContext.adminId}
      lastLogin={portalContext.lastLogin}
      navItems={navItems}
      activeNav="orgs"
    >
      {IS_DEV ? <ResetDevDataButton /> : null}

      <section id="orgs" className="rounded-xl border bg-[#0B1220] p-4" style={{ borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)" }}>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Organisation List</p>
        <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-3">
          {organisations.map((item) => (
            <article key={item.code} className="rounded-lg border border-white/10 bg-[#08172C] p-3">
              <p className="text-sm font-semibold text-[#E5E7EB]">{item.name}</p>
              <p className="mt-1 text-xs text-[#9CA3AF]">Tenant: {item.code}</p>
              <p className="text-xs text-[#9CA3AF]">Candidates: {item.candidates}</p>
              <p className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-[#C3CDDA]">{item.status}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="templates" className="rounded-xl border bg-[#0B1220] p-4" style={{ borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)" }}>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Assessment Template Library</p>
        <ul className="mt-3 space-y-2">
          {templates.map((template) => (
            <li key={template.id} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
              <p className="text-sm font-medium text-[#E5E7EB]">{template.name}</p>
              <p className="text-xs text-[#9CA3AF]">{template.version}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6E8098]">{template.usage}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="events" className="rounded-xl border bg-[#0B1220] p-4" style={{ borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)" }}>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Platform Audit Events</p>
        <ul className="mt-3 space-y-2">
          {platformEvents.map((entry) => (
            <li key={`${entry.event}-${entry.timestamp}`} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
              <p className="text-sm font-medium text-[#E5E7EB]">{entry.event}</p>
              <p className="text-xs text-[#9CA3AF]">{entry.actor}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6E8098]">{entry.timestamp}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="sessions" className="rounded-xl border bg-[#0B1220] p-4" style={{ borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)" }}>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Active Sessions</p>
        <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-3">
          {activeSessions.map((session) => (
            <article key={session.session} className="rounded-lg border border-white/10 bg-[#08172C] p-3">
              <p className="text-sm font-medium text-[#E5E7EB]">{session.session}</p>
              <p className="mt-1 text-xs text-[#9CA3AF]">{session.user}</p>
              <p className="text-xs text-[#9CA3AF]">Tenant: {session.tenant}</p>
              <p className="mt-2 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                {session.status}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="alerts" className="rounded-xl border bg-[#0B1220] p-4" style={{ borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)" }}>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Integrity Alerts</p>
        <ul className="mt-3 space-y-2 text-sm text-[#9CA3AF]">
          {integrityAlerts.length > 0 ? (
            integrityAlerts.map((alert) => (
              <li key={alert} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-100">
                {alert}
              </li>
            ))
          ) : (
            <li className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2 text-[#C3CDDA]">
              No integrity alerts currently flagged.
            </li>
          )}
        </ul>
      </section>
    </PortalShell>
  );
}
