export type AuditEvent = {
  at: string;
  type: "SYSTEM" | "INTEGRITY" | "ACTION";
  message: string;
};

type AuditFeedProps = {
  events: AuditEvent[];
};

function typeClass(type: AuditEvent["type"]) {
  if (type === "INTEGRITY") {
    return "border-amber-400/30 bg-amber-500/10 text-amber-300";
  }
  if (type === "ACTION") {
    return "border-blue-400/30 bg-blue-500/10 text-blue-300";
  }
  return "border-white/20 bg-white/5 text-[#9CA3AF]";
}

export default function AuditFeed({ events }: AuditFeedProps) {
  const latestEvents = events.slice(-10).reverse();

  return (
    <section className="rounded-xl border border-white/10 bg-[#0B1220] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#E5E7EB]">Audit Events</h3>
        <span className="text-xs text-[#8FA1B8]">Latest 10</span>
      </div>

      <div className="space-y-2">
        {latestEvents.map((event, index) => (
          <article key={`${event.at}-${event.message}-${index}`} className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] ${typeClass(event.type)}`}>
                {event.type}
              </span>
              <span className="font-mono text-xs text-[#6E8098]">{event.at}</span>
            </div>
            <p className="text-xs leading-relaxed text-[#C3CDDA]">{event.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
