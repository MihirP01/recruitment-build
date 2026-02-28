"use client";

import Link from "next/link";
import Image from "next/image";
import { Role } from "@prisma/client";
import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthActionButton from "@/components/AuthActionButton";
import NavSectionLinks from "@/components/nav-section-links";
import MobileMenu from "@/components/MobileMenu";
import ThemeCycleButton from "@/components/theme/ThemeCycleButton";
import { signOutToRoot } from "@/lib/auth/clientSignOut";
import { CTRL_EXPANSION } from "@/lib/brand";
import { useSignOutPending } from "@/lib/auth/useSignOutPending";
import { markNavigatingToHero, scrollToHero } from "@/utils/scrollToHero";

function portalLabel(role: Role): string {
  if (role === Role.CANDIDATE) return "Candidate Portal";
  if (role === Role.CLIENT) return "Client Portal";
  return "Admin Portal";
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const signInLabel = session?.user ? "Portal" : "Sign In";
  const signingOut = useSignOutPending();

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileMenuOpen) {
      return;
    }

    const onPointerDown = (event: globalThis.MouseEvent | PointerEvent) => {
      const target = event.target as Node | null;
      if (!profileMenuRef.current?.contains(target)) {
        setProfileMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileMenuOpen]);

  const handleLogoClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();

    if (pathname === "/") {
      scrollToHero();
      if (window.location.hash !== "#hero") {
        window.history.replaceState(null, "", "#hero");
      }
      return;
    }

    markNavigatingToHero();
    router.push("/#hero");
  };

  const handleSignOutClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    if (signingOut) {
      return;
    }
    setProfileMenuOpen(false);
    void signOutToRoot();
  };

  return (
    <header className="nav-shell sticky top-0 z-50">
      <div className="mx-auto flex h-[var(--nav-h)] w-full max-w-7xl items-center justify-between px-6 md:px-12">
        <Link href="/#hero" onClick={handleLogoClick} className="flex items-center gap-2.5">
          <Image
            src="/brand/ctrl-shield.png"
            alt="CTRL Shield"
            width={30}
            height={34}
            className="brand-asset h-7 w-auto md:h-8"
            priority
          />
          <Image
            src="/brand/ctrl-name.png"
            alt="CTRL"
            width={110}
            height={70}
            className="brand-asset hidden h-6 w-auto sm:block md:h-7"
            priority
          />
          <span className="hidden text-xs font-medium text-[var(--color-text-muted)] xl:inline">{CTRL_EXPANSION}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--color-text-muted)] md:flex">
          <NavSectionLinks />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeCycleButton />
          {session?.user?.isDevSession ? (
            <span className="rounded-md border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-200">
              Dev Mode
            </span>
          ) : null}
          {!session?.user ? (
            <>
              <AuthActionButton
                mode="signin"
                className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-button-ghost-bg)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-300 ease-in-out hover:bg-[var(--color-button-ghost-hover)]"
              >
                Sign In
              </AuthActionButton>
              <AuthActionButton
                mode="signup"
                className="rounded-md border border-[rgb(var(--color-accent-rgb)/0.6)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-300 ease-in-out hover:bg-[var(--color-accent-strong)]"
              >
                Sign Up
              </AuthActionButton>
            </>
          ) : (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                aria-expanded={profileMenuOpen}
                aria-controls="desktop-profile-menu"
                aria-label="Open profile menu"
                onClick={() => setProfileMenuOpen((value) => !value)}
                className="cursor-pointer rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-2 text-[var(--color-text-primary)] transition-colors duration-300 ease-in-out hover:bg-[var(--color-surface-3)]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {profileMenuOpen ? (
                <div
                  id="desktop-profile-menu"
                  className="absolute right-0 z-[90] mt-2 w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-2 shadow-xl shadow-black/20"
                >
                  <p className="px-2 py-1 text-xs text-[var(--color-text-muted)]">{session.user.email}</p>
                  <Link
                    href="/portal"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block rounded-md px-2 py-2 text-sm text-[var(--color-text-primary)] transition-colors duration-300 ease-in-out hover:bg-white/5"
                  >
                    {portalLabel(session.user.role)}
                  </Link>
                  <a
                    href="/logout"
                    onClick={handleSignOutClick}
                    aria-disabled={signingOut}
                    className={`mt-1 block w-full rounded-md px-2 py-2 text-left text-sm text-[var(--color-text-primary)] transition-colors duration-300 ease-in-out hover:bg-white/5 ${
                      signingOut ? "pointer-events-none opacity-70" : ""
                    }`}
                  >
                    {signingOut ? "Signing out..." : "Sign Out"}
                  </a>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeCycleButton compact />
          {session?.user?.isDevSession ? (
            <span className="rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200">
              Dev
            </span>
          ) : null}
          {session?.user ? (
            <Link
              href="/portal"
              className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-button-ghost-bg)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-300 ease-in-out hover:bg-[var(--color-button-ghost-hover)]"
            >
              {signInLabel}
            </Link>
          ) : (
            <AuthActionButton
              mode="signin"
              className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-button-ghost-bg)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-300 ease-in-out hover:bg-[var(--color-button-ghost-hover)]"
            >
              Sign In
            </AuthActionButton>
          )}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
