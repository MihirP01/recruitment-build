"use client";

import { MouseEvent as ReactMouseEvent } from "react";
import { signOutToRoot } from "@/lib/auth/clientSignOut";
import { useSignOutPending } from "@/lib/auth/useSignOutPending";

export function SignOutButton() {
  const signingOut = useSignOutPending();

  const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (signingOut) {
      return;
    }
    void signOutToRoot();
  };

  return (
    <a
      href="/logout"
      onClick={handleClick}
      aria-disabled={signingOut}
      className={`inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 ${
        signingOut ? "pointer-events-none opacity-70" : ""
      }`}
    >
      {signingOut ? "Signing out..." : "Sign Out"}
    </a>
  );
}
