"use client";

import { Palette } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { CTRL_THEME_LABELS, nextCtrlTheme } from "@/lib/theme/constants";

type ThemeCycleButtonProps = {
  compact?: boolean;
};

export default function ThemeCycleButton({ compact = false }: ThemeCycleButtonProps) {
  const { theme, cycleTheme } = useTheme();
  const nextTheme = nextCtrlTheme(theme);

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Switch theme. Current: ${CTRL_THEME_LABELS[theme]}. Next: ${CTRL_THEME_LABELS[nextTheme]}`}
      title={`Theme: ${CTRL_THEME_LABELS[theme]} (next: ${CTRL_THEME_LABELS[nextTheme]})`}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] transition-colors duration-200 hover:bg-[var(--color-surface-3)] ${
        compact ? "h-10 w-10" : "h-10 px-3 text-sm font-medium"
      }`}
    >
      <Palette className="h-4 w-4" />
      {!compact ? <span className="hidden lg:inline">Theme</span> : null}
    </button>
  );
}

