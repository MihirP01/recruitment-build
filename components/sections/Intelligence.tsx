const intelligenceItems = [
  {
    title: "Structured Evaluation",
    description: "Assessment delivery and scoring follow a controlled model with consistent evaluation criteria."
  },
  {
    title: "Performance Analytics",
    description: "Recruiters can review candidate outcomes and detailed answers for evidence-based progression."
  },
  {
    title: "Client-Ready Reporting",
    description: "Shared candidate summaries align assessment results and recruiter context for client review."
  }
];

export default function IntelligenceSection() {
  return (
    <section id="intelligence" className="scroll-mt-28 bg-slate-200/40 py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h2 className="text-3xl font-semibold text-slate-900">Assessment Intelligence</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {intelligenceItems.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
