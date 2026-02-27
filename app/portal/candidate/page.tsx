import {
  activityTimeline,
  recruiterAnnouncements
} from "@/lib/portal/candidate-data";
import { getCandidatePortalContext } from "@/lib/portal/candidate-context";
import { getAssessmentsForCandidateEmail } from "@/lib/data";
import CandidatePortalLayout from "@/components/portal/candidate/CandidatePortalLayout";

export default async function PortalCandidatePage() {
  const portalContext = await getCandidatePortalContext();
  const assessments = await getAssessmentsForCandidateEmail(portalContext.candidateEmail);
  const assigned = assessments.length;
  const completed = assessments.filter((item) => item.status === "Completed").length;
  const pending = assessments.filter((item) => item.status === "Pending" || item.status === "In Progress").length;
  const expiringSoon = assessments.filter(
    (item) => item.status !== "Completed" && item.status !== "Expired" && item.deadlineCountdown.toLowerCase().includes("expires")
  ).length;

  const summaryCards = [
    { label: "Assigned Assessments", value: assigned.toString() },
    { label: "Completed", value: completed.toString() },
    { label: "Pending", value: pending.toString() },
    { label: "Expiring Soon", value: expiringSoon.toString() }
  ];

  return (
    <CandidatePortalLayout
      {...portalContext}
      activeNav="dashboard"
      sectionTitle="Candidate Dashboard"
      sectionDescription="Operational overview of your assigned assessments, workflow deadlines, and monitored activity records."
    >
      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <article key={item.label} className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#E5E7EB]">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Activity Timeline</p>
          <ul className="mt-4 space-y-3">
            {activityTimeline.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                <p className="text-sm font-medium text-[#D7DEEA]">{entry.event}</p>
                <p className="text-xs text-[#9CA3AF]">{entry.detail}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6E8098]">{entry.timestamp}</p>
              </li>
            ))}
          </ul>
        </article>

        <aside className="space-y-4">
          <article className="rounded-xl border border-white/10 bg-[#0B1220] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Upcoming Deadlines</p>
            <ul className="mt-3 space-y-2">
              {assessments
                .filter((item) => item.status === "Pending" || item.status === "In Progress")
                .slice(0, 3)
                .map((item) => (
                  <li key={item.id} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
                    <p className="text-sm font-medium text-[#D7DEEA]">{item.name}</p>
                    <p className="mt-1 text-xs text-amber-300">{item.deadlineCountdown}</p>
                  </li>
                ))}
              {assessments.filter((item) => item.status === "Pending" || item.status === "In Progress").length === 0 ? (
                <li className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2 text-sm text-[#9CA3AF]">
                  No pending assessment deadlines.
                </li>
              ) : null}
            </ul>
          </article>

          <article className="rounded-xl border border-white/10 bg-[#0B1220] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Integrity Notice</p>
            <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
              Assessment activity is monitored and auditable. Use a compliant desktop environment to avoid launch restrictions.
            </p>
          </article>
        </aside>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#0B1220] p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Recruiter Announcements</p>
        <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
          {recruiterAnnouncements.map((announcement) => (
            <article key={announcement.id} className="rounded-lg border border-white/10 bg-[#08172C] p-3">
              <p className="text-sm font-semibold text-[#E5E7EB]">{announcement.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">{announcement.detail}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#6E8098]">{announcement.publishedAt}</p>
            </article>
          ))}
        </div>
      </section>
    </CandidatePortalLayout>
  );
}
