"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  FileText,
  Files,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  LogOut,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users
} from "lucide-react";
import { MouseEvent as ReactMouseEvent, ReactNode, useEffect, useMemo, useState } from "react";
import AnimatedMenuButton from "@/components/ui/AnimatedMenuButton";
import { signOutToRoot } from "@/lib/auth/clientSignOut";
import { useSignOutPending } from "@/lib/auth/useSignOutPending";
import { TenantSlug } from "@/lib/portal/tenant";

export type PortalRole = "candidate" | "client" | "admin";

export type PortalNavIconKey =
  | "layout-dashboard"
  | "clipboard-list"
  | "message-square"
  | "file-text"
  | "life-buoy"
  | "user-cog"
  | "lock-keyhole"
  | "list-checks"
  | "clipboard-check"
  | "files"
  | "shield-check"
  | "building-2"
  | "file-stack"
  | "shield-alert"
  | "users"
  | "alert-octagon";

export type PortalNavItem = {
  id: string;
  label: string;
  href: string;
  icon: PortalNavIconKey;
};

type PortalShellProps = {
  role: PortalRole;
  tenant: TenantSlug;
  portalLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  userName: string;
  userEmail: string;
  referenceLabel: string;
  referenceValue: string;
  lastLogin: string;
  navItems: PortalNavItem[];
  activeNav: string;
  children: ReactNode;
};

const NAV_ICONS: Record<PortalNavIconKey, React.ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  "clipboard-list": ClipboardList,
  "message-square": MessageSquare,
  "file-text": FileText,
  "life-buoy": LifeBuoy,
  "user-cog": UserCog,
  "lock-keyhole": LockKeyhole,
  "list-checks": ListChecks,
  "clipboard-check": ClipboardCheck,
  files: Files,
  "shield-check": ShieldCheck,
  "building-2": Building2,
  "file-stack": FileStack,
  "shield-alert": ShieldAlert,
  users: Users,
  "alert-octagon": AlertOctagon
};

function roleSessionLabel(role: PortalRole) {
  if (role === "admin") {
    return "Admin Session";
  }
  if (role === "client") {
    return "Client Session";
  }
  return "Candidate Session";
}

export default function PortalShell({
  role,
  tenant,
  portalLabel,
  sectionTitle,
  sectionDescription,
  userName,
  userEmail,
  referenceLabel,
  referenceValue,
  lastLogin,
  navItems,
  activeNav,
  children
}: PortalShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const signingOut = useSignOutPending();

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const scrollRoot = document.getElementById("app-scroll") ?? document.getElementById("system-snap-root");
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = scrollRoot?.style.overflowY ?? "";

    document.body.style.overflow = "hidden";
    if (scrollRoot) {
      scrollRoot.style.overflowY = "hidden";
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      if (scrollRoot) {
        scrollRoot.style.overflowY = previousRootOverflow;
      }
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const accentBorderStyle = useMemo(
    () => ({
      borderColor: "rgb(var(--tenant-accent-rgb) / 0.24)"
    }),
    []
  );

  const activeNavStyle = useMemo(
    () => ({
      borderColor: "rgb(var(--role-accent-rgb) / 0.48)",
      backgroundColor: "rgb(var(--role-accent-rgb) / 0.18)"
    }),
    []
  );

  const roleActionStyle = useMemo(
    () => ({
      borderColor: "rgb(var(--role-accent-rgb) / 0.6)",
      backgroundColor: "rgb(var(--role-accent-rgb) / 0.85)"
    }),
    []
  );

  const secureIndicatorStyle = useMemo(
    () => ({
      borderColor: "rgb(var(--tenant-accent-rgb) / 0.34)",
      backgroundColor: "rgb(var(--tenant-accent-rgb) / 0.16)"
    }),
    []
  );

  const secureDotStyle = useMemo(
    () => ({
      backgroundColor: "var(--role-accent)"
    }),
    []
  );

  const handleSignOut = (event: ReactMouseEvent<HTMLAnchorElement>) => {
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
    <div
      data-role={role}
      data-tenant={tenant}
      className="h-dvh overflow-hidden bg-[var(--color-app-bg)] text-[var(--color-text-primary)]"
    >
      <header className="sticky top-0 z-[70] border-b bg-[var(--color-surface-0)] pointer-events-auto" style={accentBorderStyle}>
        <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            {!mobileMenuOpen ? (
              <div className="lg:hidden">
                <AnimatedMenuButton
                  open={false}
                  onClick={() => setMobileMenuOpen(true)}
                  controlsId="portal-mobile-nav"
                  openLabel="Close portal navigation"
                  closedLabel="Open portal navigation"
                />
              </div>
            ) : null}
            <Image src="/brand/ctrl-shield.png" alt="CTRL Shield" width={24} height={28} className="h-6 w-auto sm:h-7" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-wide text-[var(--color-text-primary)]">{portalLabel}</p>
              <p className="truncate text-xs text-[var(--color-text-muted)]">{sectionTitle}</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{userName}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{userEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{referenceLabel}</p>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{referenceValue}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Last Login</p>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{lastLogin}</p>
            </div>
          </div>

          <div className="relative z-[80] flex items-center gap-2 sm:gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border sm:h-auto sm:w-auto sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs sm:font-medium text-[var(--color-text-primary)]"
              style={secureIndicatorStyle}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={secureDotStyle} />
              <span className="hidden sm:inline">{roleSessionLabel(role)}</span>
            </div>
            <a
              href="/logout"
              onClick={handleSignOut}
              aria-disabled={signingOut}
              className={`relative z-10 pointer-events-auto inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] px-2.5 py-2 text-xs font-medium text-[var(--color-text-primary)] transition-opacity hover:opacity-90 sm:px-3 ${
                signingOut ? "pointer-events-none opacity-70" : ""
              }`}
              style={roleActionStyle}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{signingOut ? "Signing out..." : "Logout"}</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100dvh-72px)] overflow-hidden">
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface-0)] lg:block">
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = NAV_ICONS[item.icon];
              const active = activeNav === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "text-[var(--color-text-primary)]"
                      : "border-transparent text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                  }`}
                  style={active ? activeNavStyle : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-40 pointer-events-none lg:hidden">
            <motion.button
              type="button"
              className="pointer-events-auto absolute inset-0 bg-black/60"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              id="portal-mobile-nav"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto absolute inset-y-0 left-0 w-64 border-r border-[var(--color-border)] bg-[var(--color-surface-0)] p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Navigation</p>
                <AnimatedMenuButton
                  open
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  openLabel="Close portal navigation"
                  closedLabel="Open portal navigation"
                />
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = NAV_ICONS[item.icon];
                  const active = activeNav === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "text-[var(--color-text-primary)]"
                          : "border-transparent text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                      }`}
                      style={active ? activeNavStyle : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </div>
        ) : null}

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6">
            <section className="mb-6 rounded-xl border bg-[var(--color-surface-0)] p-5" style={accentBorderStyle}>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{portalLabel}</p>
              <h1 className="mt-2 text-3xl font-semibold leading-[1.12] text-[var(--color-text-primary)] md:text-4xl">{sectionTitle}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--color-text-muted)]">{sectionDescription}</p>
            </section>
            <div className="space-y-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
