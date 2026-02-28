"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { markNavigatingToHero, scrollToHero } from "@/utils/scrollToHero";

export type AuthMode = "signin" | "signup";

type AuthUIContextValue = {
  isOpen: boolean;
  mode: AuthMode;
  openSignin: () => void;
  openSignup: () => void;
  closeAuth: () => void;
  setMode: (mode: AuthMode) => void;
};

const AuthUIContext = createContext<AuthUIContextValue | undefined>(undefined);
const HERO_SCROLL_MAX_WAIT_MS = 1800;
const HERO_SCROLL_POLL_MS = 60;

function shouldRepositionToHero(): boolean {
  if (typeof window === "undefined" || window.location.pathname !== "/") {
    return false;
  }

  const hero = document.getElementById("hero");
  if (!hero) {
    return false;
  }

  const scrollRoot = document.getElementById("app-scroll") ?? document.getElementById("system-snap-root");
  const rootTop = scrollRoot ? scrollRoot.getBoundingClientRect().top : 0;
  const expectedHeroTop = rootTop;
  const currentHeroTop = hero.getBoundingClientRect().top;

  return Math.abs(currentHeroTop - expectedHeroTop) > 12;
}

export function AuthUIProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<{ isOpen: boolean; mode: AuthMode }>({
    isOpen: false,
    mode: "signin"
  });
  const stateRef = useRef(state);
  const pendingOpenTimeoutRef = useRef<number | undefined>(undefined);
  const hasHandledSearchModeRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && typeof pendingOpenTimeoutRef.current === "number") {
        window.clearTimeout(pendingOpenTimeoutRef.current);
      }
    };
  }, []);

  const closeAuth = useCallback(() => {
    if (typeof window !== "undefined" && typeof pendingOpenTimeoutRef.current === "number") {
      window.clearTimeout(pendingOpenTimeoutRef.current);
      pendingOpenTimeoutRef.current = undefined;
    }
    setState((current) => ({ ...current, isOpen: false }));
  }, []);

  const openAuth = useCallback(
    (mode: AuthMode) => {
      const current = stateRef.current;

      if (current.isOpen && current.mode === mode) {
        closeAuth();
        return;
      }

      if (current.isOpen) {
        setState((value) => ({ ...value, mode, isOpen: true }));
        return;
      }

      if (typeof window !== "undefined" && typeof pendingOpenTimeoutRef.current === "number") {
        window.clearTimeout(pendingOpenTimeoutRef.current);
        pendingOpenTimeoutRef.current = undefined;
      }

      markNavigatingToHero();
      scrollToHero();
      if (window.location.hash !== "#hero") {
        const url = new URL(window.location.href);
        url.hash = "hero";
        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }

      const startedAt = Date.now();
      const waitForHeroAlignment = () => {
        if (!shouldRepositionToHero() || Date.now() - startedAt >= HERO_SCROLL_MAX_WAIT_MS) {
          setState({ isOpen: true, mode });
          pendingOpenTimeoutRef.current = undefined;
          return;
        }

        pendingOpenTimeoutRef.current = window.setTimeout(waitForHeroAlignment, HERO_SCROLL_POLL_MS);
      };

      waitForHeroAlignment();
    },
    [closeAuth]
  );

  const openSignin = useCallback(() => {
    openAuth("signin");
  }, [openAuth]);

  const openSignup = useCallback(() => {
    openAuth("signup");
  }, [openAuth]);

  const setMode = useCallback((mode: AuthMode) => {
    setState((current) => ({ ...current, mode }));
  }, []);

  useEffect(() => {
    if (hasHandledSearchModeRef.current || typeof window === "undefined" || window.location.pathname !== "/") {
      return;
    }

    hasHandledSearchModeRef.current = true;
    const url = new URL(window.location.href);
    const authMode = url.searchParams.get("auth");
    if (authMode !== "signin" && authMode !== "signup") {
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      openAuth(authMode);

      url.searchParams.delete("auth");
      if (!url.hash) {
        url.hash = "hero";
      }
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [openAuth]);

  const contextValue = useMemo<AuthUIContextValue>(
    () => ({
      isOpen: state.isOpen,
      mode: state.mode,
      openSignin,
      openSignup,
      closeAuth,
      setMode
    }),
    [closeAuth, openSignin, openSignup, setMode, state.isOpen, state.mode]
  );

  return <AuthUIContext.Provider value={contextValue}>{children}</AuthUIContext.Provider>;
}

export function useAuthUI() {
  const context = useContext(AuthUIContext);
  if (!context) {
    throw new Error("useAuthUI must be used within an AuthUIProvider");
  }
  return context;
}
