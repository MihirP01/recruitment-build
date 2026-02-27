import CandidatePortalLayout from "@/components/portal/candidate/CandidatePortalLayout";
import { getCandidatePortalContext } from "@/lib/portal/candidate-context";
import { supportOptions } from "@/lib/portal/candidate-data";

export default async function CandidateSupportPage() {
  const portalContext = await getCandidatePortalContext();

  return (
    <CandidatePortalLayout
      {...portalContext}
      activeNav="support"
      sectionTitle="Support"
      sectionDescription="Submit controlled support requests for technical issues, assessment incidents, accessibility needs, or recruitment contact."
    >
      <section className="grid min-w-0 gap-4 md:grid-cols-2">
        {supportOptions.map((option) => (
          <article key={option.id} className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
            <p className="text-sm font-semibold text-[#E5E7EB]">{option.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">{option.detail}</p>
            <a
              href={option.actionHref}
              className="mt-4 inline-flex rounded-md border border-[#5B7EA6]/60 bg-[#5B7EA6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6f93bd]"
            >
              {option.actionLabel}
            </a>
          </article>
        ))}
      </section>
    </CandidatePortalLayout>
  );
}
