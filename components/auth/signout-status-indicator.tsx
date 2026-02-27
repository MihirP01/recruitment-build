"use client";

import { useSignOutPending } from "@/lib/auth/useSignOutPending";

export default function SignOutStatusIndicator() {
  const pending = useSignOutPending();

  if (!pending) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[140] flex justify-center px-4 pt-2" role="status" aria-live="polite">
      <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-[#020617]/95 px-3 py-1.5 text-xs font-medium text-[#E5E7EB] shadow-lg shadow-black/25">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#5B7EA6]" />
        Signing out...
      </div>
    </div>
  );
}
