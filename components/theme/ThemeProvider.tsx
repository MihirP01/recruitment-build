"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  CTRL_THEME_STORAGE_KEY,
  CTRL_THEMES,
  CtrlTheme,
  DEFAULT_CTRL_THEME,
  isCtrlTheme,
  nextCtrlTheme
} from "@/lib/theme/constants";

type ThemeContextValue = {
  theme: CtrlTheme;
  setTheme: (theme: CtrlTheme) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveInitialTheme(): CtrlTheme {
  if (typeof document === "undefined") {
    return DEFAULT_CTRL_THEME;
  }

  const rootTheme = document.documentElement.dataset.theme;
  if (isCtrlTheme(rootTheme)) {
    return rootTheme;
  }

  return DEFAULT_CTRL_THEME;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<CtrlTheme>(resolveInitialTheme);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem(CTRL_THEME_STORAGE_KEY);
    const resolvedTheme = isCtrlTheme(storedTheme)
      ? storedTheme
      : isCtrlTheme(document.documentElement.dataset.theme)
        ? (document.documentElement.dataset.theme as CtrlTheme)
        : DEFAULT_CTRL_THEME;

    setThemeState(resolvedTheme);
    document.documentElement.dataset.theme = resolvedTheme;
    window.localStorage.setItem(CTRL_THEME_STORAGE_KEY, resolvedTheme);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(CTRL_THEME_STORAGE_KEY, theme);
  }, [ready, theme]);

  const setTheme = useCallback((nextTheme: CtrlTheme) => {
    if (!CTRL_THEMES.includes(nextTheme)) {
      return;
    }
    setThemeState(nextTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => nextCtrlTheme(current));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      cycleTheme
    }),
    [cycleTheme, setTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }
  return context;
}

