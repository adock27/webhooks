export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "guess-theme";

export function resolveDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyThemeClass(isDark: boolean): void {
  document.documentElement.classList.toggle("dark", isDark);
}

export function setMetaThemeColor(hexLight: string, hexDark: string, isDark: boolean): void {
  const el = document.querySelector('meta[name="theme-color"]');
  if (el) el.setAttribute("content", isDark ? hexDark : hexLight);
}
