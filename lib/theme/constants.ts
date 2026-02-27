export const CTRL_THEMES = ["ctrl-dark", "ctrl-blue", "ctrl-slate", "ctrl-light"] as const;

export type CtrlTheme = (typeof CTRL_THEMES)[number];

export const DEFAULT_CTRL_THEME: CtrlTheme = "ctrl-dark";
export const CTRL_THEME_STORAGE_KEY = "ctrl-theme";

export const CTRL_THEME_LABELS: Record<CtrlTheme, string> = {
  "ctrl-dark": "Dark",
  "ctrl-blue": "Blue",
  "ctrl-slate": "Slate",
  "ctrl-light": "Light"
};

export function isCtrlTheme(value: unknown): value is CtrlTheme {
  return typeof value === "string" && CTRL_THEMES.includes(value as CtrlTheme);
}

export function nextCtrlTheme(currentTheme: CtrlTheme): CtrlTheme {
  const currentIndex = CTRL_THEMES.indexOf(currentTheme);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % CTRL_THEMES.length;
  return CTRL_THEMES[nextIndex];
}

