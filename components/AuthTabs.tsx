"use client";

import { AuthMode } from "@/components/AuthUIProvider";

type AuthTabsProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export default function AuthTabs({ mode, onModeChange }: AuthTabsProps) {
  return (
    <div role="tablist" aria-label="Authentication mode" className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] p-1">
      <button
        id="auth-tab-signin"
        role="tab"
        type="button"
        aria-selected={mode === "signin"}
        aria-controls="auth-tabpanel"
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
          mode === "signin"
            ? "bg-[var(--color-accent-surface)] text-[var(--color-text-primary)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        }`}
        onClick={() => onModeChange("signin")}
      >
        Sign In
      </button>
      <button
        id="auth-tab-signup"
        role="tab"
        type="button"
        aria-selected={mode === "signup"}
        aria-controls="auth-tabpanel"
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
          mode === "signup"
            ? "bg-[var(--color-accent-surface)] text-[var(--color-text-primary)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        }`}
        onClick={() => onModeChange("signup")}
      >
        Sign Up
      </button>
    </div>
  );
}
