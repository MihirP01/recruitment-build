"use client";

import Image from "next/image";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";

type SecureAssessmentShellProps = {
  assessmentName: string;
  timerLabel: string;
  secureModeActive: boolean;
  warningsCount: number;
  onExit: () => void;
  children: ReactNode;
};

export default function SecureAssessmentShell({
  assessmentName,
  timerLabel,
  secureModeActive,
  warningsCount,
  onExit,
  children
}: SecureAssessmentShellProps) {
  return (
    <div className="h-full overflow-hidden bg-[#0B1220] text-[#E5E7EB]">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#020617]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-3 px-4 md:px-6">
          <Image src="/brand/ctrl-shield.png" alt="CTRL Shield" width={24} height={28} className="h-7 w-auto" priority />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8FA1B8]">Candidate Portal</p>
            <p className="truncate text-sm font-medium text-[#D7DEEA]">{assessmentName}</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#D7DEEA] sm:inline-flex">
              <span className="font-medium">{timerLabel}</span>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                secureModeActive
                  ? "border-[rgb(var(--role-accent-rgb)/0.48)] bg-[rgb(var(--role-accent-rgb)/0.2)] text-white"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-200"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{secureModeActive ? "Secure Mode Active" : "Secure Mode Pending"}</span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#C3CDDA]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Warnings {warningsCount}
            </div>
            <button
              type="button"
              onClick={onExit}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#D7DEEA] transition-colors hover:bg-white/10"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="h-full overflow-y-auto overflow-x-hidden pt-[72px]">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6">{children}</div>
      </main>
    </div>
  );
}

