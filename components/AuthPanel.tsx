"use client";

import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthUI } from "@/components/AuthUIProvider";
import AuthForm from "@/components/AuthForm";
import AuthTabs from "@/components/AuthTabs";
import DevelopmentAccessPanel from "@/components/dev/DevelopmentAccessPanel";
import { IS_DEV } from "@/lib/env/isDev";

const PANEL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
let authPanelScrollLockCount = 0;

export default function AuthPanel() {
  const { data: session } = useSession();
  const { isOpen, mode, setMode, closeAuth } = useAuthUI();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAuth();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeAuth, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const scrollRoot = document.getElementById("app-scroll") ?? document.getElementById("system-snap-root");
    authPanelScrollLockCount += 1;
    if (authPanelScrollLockCount === 1) {
      document.documentElement.style.scrollSnapType = "none";
      document.documentElement.style.overflowAnchor = "none";
      document.body.style.overflow = "hidden";
      if (scrollRoot) {
        scrollRoot.style.scrollSnapType = "none";
        scrollRoot.style.overflowAnchor = "none";
        scrollRoot.scrollTop = 0;
        scrollRoot.style.overflowY = "hidden";
      }
    }

    return () => {
      authPanelScrollLockCount = Math.max(0, authPanelScrollLockCount - 1);
      if (authPanelScrollLockCount === 0) {
        document.documentElement.style.scrollSnapType = "";
        document.documentElement.style.overflowAnchor = "";
        document.body.style.overflow = "";
        if (scrollRoot) {
          scrollRoot.style.scrollSnapType = "";
          scrollRoot.style.overflowAnchor = "";
          scrollRoot.style.overflowY = "";
        }
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (session?.user && isOpen) {
      closeAuth();
    }
  }, [closeAuth, isOpen, session?.user]);

  if (session?.user) {
    return null;
  }

  return (
    <MotionConfig transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: PANEL_EASE }}>
      <motion.section className="w-full" aria-label="Authentication panel region">
        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              id="inline-auth-panel"
              key="inline-auth-panel"
              initial={shouldReduceMotion ? { height: "auto" } : { height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.34, ease: PANEL_EASE }}
              className="origin-top overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface-0)]"
            >
              <motion.div
                className="min-h-0"
                initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: "easeOut" }}
              >
                <div className="mx-auto w-full max-w-5xl px-6 py-10">
                  <div className="max-h-[calc(100svh-var(--nav-h)-1.5rem)] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)]/80 p-5 backdrop-blur-xl md:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="section-label text-[var(--color-text-subtle)]">Secure Access</p>
                        <h2 className="mt-1 text-xl font-semibold text-[var(--color-text-primary)] md:text-2xl">CTRL Authentication</h2>
                      </div>
                      <button
                        type="button"
                        onClick={closeAuth}
                        className="h-10 rounded-lg border border-[var(--color-border)] bg-white/5 px-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-200 hover:bg-white/10"
                      >
                        Close
                      </button>
                    </div>

                    <AuthTabs mode={mode} onModeChange={setMode} />

                    <div className="mt-4 space-y-4">
                      <AuthForm mode={mode} isActive={isOpen} onSuccess={closeAuth} />
                      <AnimatePresence initial={false}>
                        {IS_DEV && mode === "signin" ? (
                          <motion.div
                            key="dev-access-panel"
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={shouldReduceMotion ? { opacity: 1, y: 0, height: "auto" } : { opacity: 0, y: -6, height: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <DevelopmentAccessPanel />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.section>
    </MotionConfig>
  );
}
