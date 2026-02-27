"use client";

import { PropsWithChildren, useEffect } from "react";
import { usePathname } from "next/navigation";
import SignOutStatusIndicator from "@/components/auth/signout-status-indicator";
import Navbar from "@/components/Navbar";
import AuthPanel from "@/components/AuthPanel";

export default function PublicSiteFrame({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    if (!isHomepage) {
      document.documentElement.dataset.tone = "0";
      return;
    }

    if (!document.documentElement.dataset.tone) {
      document.documentElement.dataset.tone = "0";
    }
  }, [isHomepage]);

  return (
    <div id="app-shell" className={isHomepage ? "bg-[var(--color-app-bg)] text-[var(--color-text-primary)]" : undefined}>
      <SignOutStatusIndicator />
      {isHomepage ? <Navbar /> : null}
      {isHomepage ? <AuthPanel /> : null}
      <main id="app-scroll" className={isHomepage ? "system-snap-root" : undefined}>
        {children}
      </main>
    </div>
  );
}
