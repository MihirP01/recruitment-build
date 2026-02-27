"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

type PortalClientShellProps = PropsWithChildren<{
  session?: Session | null;
}>;

export default function PortalClientShell({ children, session }: PortalClientShellProps) {
  const [hydrated, setHydrated] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    setHydrated(true);
    if (!isDev) {
      return;
    }

    document.documentElement.dataset.portalHydrated = "true";
    return () => {
      delete document.documentElement.dataset.portalHydrated;
    };
  }, [isDev]);

  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60}
      refetchOnWindowFocus
      refetchWhenOffline={false}
    >
      {children}
      {isDev ? (
        <div className="pointer-events-none fixed bottom-3 right-3 z-[200] rounded-md border border-white/15 bg-[#020617]/90 px-2.5 py-1 text-[11px] font-medium tracking-[0.08em] text-[#D7DEEA] backdrop-blur">
          {hydrated ? "Portal: Hydrated" : "Portal: Hydrating..."}
        </div>
      ) : null}
    </SessionProvider>
  );
}
