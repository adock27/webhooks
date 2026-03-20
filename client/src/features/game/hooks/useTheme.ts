import { useCallback, useEffect, useState } from "react";
import {
  applyThemeClass,
  resolveDark,
  setMetaThemeColor,
  type ThemeMode,
  THEME_STORAGE_KEY,
} from "../../../lib/theme";

const META_LIGHT = "#eef1f7";
const META_DARK = "#0a0d12";

function readStoredMode(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* */
  }
  return "system";
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);

  const setMode = useCallback((next: ThemeMode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* */
    }
    setModeState(next);
    const dark = resolveDark(next);
    applyThemeClass(dark);
    setMetaThemeColor(META_LIGHT, META_DARK, dark);
  }, []);

  useEffect(() => {
    const dark = resolveDark(mode);
    applyThemeClass(dark);
    setMetaThemeColor(META_LIGHT, META_DARK, dark);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const dark = resolveDark("system");
      applyThemeClass(dark);
      setMetaThemeColor(META_LIGHT, META_DARK, dark);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const resolved: "light" | "dark" = resolveDark(mode) ? "dark" : "light";

  return { mode, setMode, resolved };
}
