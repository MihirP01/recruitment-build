export default function DemoSection() {
  return (
    <section id="demo" className="scroll-mt-28 py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-semibold text-slate-900">Request Demo</h2>
          <p className="mt-2 text-sm text-slate-600">Share your details and CTRL will follow up through secure channels.</p>

          <form action="#demo" method="get" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="demo-name" className="text-sm font-medium text-slate-700">Name</label>
                <input id="demo-name" name="name" required className="w-full" />
              </div>
              <div className="space-y-1">
                <label htmlFor="demo-organisation" className="text-sm font-medium text-slate-700">Organisation</label>
                <input id="demo-organisation" name="organisation" required className="w-full" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="demo-email" className="text-sm font-medium text-slate-700">Work Email</label>
              <input id="demo-email" name="email" type="email" required className="w-full" />
            </div>

            <div className="space-y-1">
              <label htmlFor="demo-message" className="text-sm font-medium text-slate-700">Message</label>
              <textarea id="demo-message" name="message" required minLength={12} rows={5} className="w-full" />
            </div>

            <button type="submit" className="w-full bg-brand-700 text-white hover:bg-brand-900">Submit Request</button>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            Prefer secure contact? Email: <a className="font-medium text-brand-700 underline" href="mailto:contact@ctrl-platform.uk">contact@ctrl-platform.uk</a>
          </p>
        </div>
      </div>
    </section>
  );
}
