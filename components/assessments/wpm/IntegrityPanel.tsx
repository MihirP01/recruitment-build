import { ShieldCheck, ShieldX, ClipboardX, Monitor, Focus } from "lucide-react";

type IntegrityPanelProps = {
  focusLossCount: number;
  tabSwitchCount: number;
  pasteAttempts: number;
  fullscreenEnabled: boolean;
  suspiciousBurstDetected: boolean;
  violationCount: number;
};

function statusBadge(ok: boolean, label: string) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        ok
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
          : "border-amber-400/30 bg-amber-500/10 text-amber-300"
      }`}
    >
      {label}
    </span>
  );
}

export default function IntegrityPanel({
  focusLossCount,
  tabSwitchCount,
  pasteAttempts,
  fullscreenEnabled,
  suspiciousBurstDetected,
  violationCount
}: IntegrityPanelProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#0B1220] p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#8FA1B8]" />
        <h3 className="text-sm font-semibold text-[#E5E7EB]">Integrity Status</h3>
      </div>

      <div className="space-y-3 text-sm text-[#9CA3AF]">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
          <div className="flex items-center gap-2">
            <Focus className="h-4 w-4 text-[#8FA1B8]" />
            <span>Focus</span>
          </div>
          {statusBadge(focusLossCount === 0, focusLossCount === 0 ? "OK" : `Warnings ${focusLossCount}`)}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-[#8FA1B8]" />
            <span>Fullscreen</span>
          </div>
          {statusBadge(fullscreenEnabled, fullscreenEnabled ? "On" : "Off")}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
          <div className="flex items-center gap-2">
            <ClipboardX className="h-4 w-4 text-[#8FA1B8]" />
            <span>Paste Protection</span>
          </div>
          {statusBadge(true, "Blocked")}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
            <p className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Tab Switches</p>
            <p className="mt-1 text-base font-medium text-[#D7DEEA]">{tabSwitchCount}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
            <p className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Paste Attempts</p>
            <p className="mt-1 text-base font-medium text-[#D7DEEA]">{pasteAttempts}</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
          <p className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Suspicious Pattern</p>
          <p className={`mt-1 text-sm font-medium ${suspiciousBurstDetected ? "text-amber-300" : "text-emerald-300"}`}>
            {suspiciousBurstDetected ? "Flagged" : "None Detected"}
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#08172C] px-3 py-2">
          <p className="text-xs uppercase tracking-[0.12em] text-[#6E8098]">Integrity Violations</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#D7DEEA]">
            <ShieldX className="h-4 w-4 text-[#8FA1B8]" />
            {violationCount}
          </p>
        </div>
      </div>
    </section>
  );
}
