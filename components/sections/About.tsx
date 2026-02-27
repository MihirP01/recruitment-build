export default function AboutSection() {
  return (
    <section id="about" className="scroll-mt-28 py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Built for Secure Public Sector Recruitment</h2>
          <p className="mt-4 text-slate-600">
            CTRL supports sensitive recruitment operations with controlled access, accountable actions, and
            structured decision support across candidate, recruiter, and client workflows.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">Role-based secure access</li>
            <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">Audit logging</li>
            <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">Assessment-driven evaluation</li>
            <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">Recruiter-to-client workflow integrity</li>
          </ul>
        </div>

        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-200 p-8">
          <div className="flex h-72 w-full max-w-md items-center justify-center rounded-xl border border-slate-300 bg-white/80 shadow-sm">
            <div className="h-40 w-40 animate-pulse rounded-full border-2 border-dashed border-slate-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
