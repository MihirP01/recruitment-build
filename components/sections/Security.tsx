const securityItems = [
  {
    title: "Zero Trust Access Control",
    description: "Role, session, and ownership checks are enforced server-side for each protected workflow."
  },
  {
    title: "End-to-End Data Protection",
    description: "Sensitive recruitment data is safeguarded through hardened transport, storage, and session controls."
  },
  {
    title: "Audit & Oversight",
    description: "Immutable logs provide traceability for authentication, candidate decisions, and assessment actions."
  }
];

export default function SecuritySection() {
  return (
    <section id="security" className="scroll-mt-28 py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h2 className="text-3xl font-semibold text-slate-900">Platform Security</h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          Designed to support high-assurance public sector recruitment with layered controls and operational accountability.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {securityItems.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">■</div>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
