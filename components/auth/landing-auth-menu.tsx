"use client";

import Link from "next/link";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { signOutToRoot } from "@/lib/auth/clientSignOut";
import { rolePathPrefix } from "@/lib/auth/roles";
import { useSignOutPending } from "@/lib/auth/useSignOutPending";

function portalPath(role: Role): string {
  return rolePathPrefix(role);
}

function portalLabel(role: Role): string {
  if (role === Role.CANDIDATE) return "Candidate Portal";
  if (role === Role.CLIENT) return "Client Portal";
  return "Admin Portal";
}

export function LandingAuthMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const signingOut = useSignOutPending();

  const handleSignOutClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (signingOut) {
      return;
    }
    void signOutToRoot();
  };

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", onClickOutside);
    }

    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (status === "loading") {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-slate-200" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login/candidate"
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
      >
        Log In
      </Link>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        aria-label="Open profile menu"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <p className="px-2 py-1 text-xs text-slate-500">{session.user.email}</p>
          <Link
            href={portalPath(session.user.role)}
            className="block rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            {portalLabel(session.user.role)}
          </Link>
          <a
            href="/logout"
            onClick={handleSignOutClick}
            aria-disabled={signingOut}
            className={`mt-1 block w-full rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 ${
              signingOut ? "pointer-events-none opacity-70" : ""
            }`}
          >
            {signingOut ? "Signing out..." : "Sign Out"}
          </a>
        </div>
      ) : null}
    </div>
  );
}
