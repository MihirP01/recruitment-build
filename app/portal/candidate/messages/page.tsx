import CandidatePortalLayout from "@/components/portal/candidate/CandidatePortalLayout";
import { getCandidatePortalContext } from "@/lib/portal/candidate-context";
import { secureConversations, selectedThread } from "@/lib/portal/candidate-data";

export default async function CandidateMessagesPage() {
  const portalContext = await getCandidatePortalContext();

  return (
    <CandidatePortalLayout
      {...portalContext}
      activeNav="messages"
      sectionTitle="Secure Messages"
      sectionDescription="Operational message channel between candidate, recruitment operations, and assessment support."
    >
      <section className="grid min-w-0 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Conversations</p>
          <ul className="mt-4 space-y-2">
            {secureConversations.map((conversation, index) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    index === 0
                      ? "border-[#5B7EA6]/40 bg-[#1B2C43]"
                      : "border-white/10 bg-[#08172C] hover:bg-[#11233d]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[#E5E7EB]">{conversation.title}</p>
                    {conversation.unread ? (
                      <span className="inline-flex h-2 w-2 rounded-full bg-[#7EA2C8]" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-[#9CA3AF]">{conversation.from}</p>
                  <p className="mt-1 truncate text-xs text-[#C3CDDA]">{conversation.lastMessage}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#6E8098]">{conversation.updatedAt}</p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <article className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-4">
          <div className="border-b border-white/10 pb-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Thread</p>
            <p className="mt-1 text-sm font-semibold text-[#E5E7EB]">Assessment Support Desk</p>
          </div>
          <ul className="mt-4 space-y-3">
            {selectedThread.map((message) => (
              <li key={message.id} className="rounded-lg border border-white/10 bg-[#08172C] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#E5E7EB]">{message.sender}</p>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">{message.timestamp}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#C3CDDA]">{message.body}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </CandidatePortalLayout>
  );
}
