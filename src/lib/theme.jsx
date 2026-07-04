import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "notarium:theme";

// Dark mode is a dashboard-only feature. The public landing page and the
// auth pages always render in light mode, regardless of the stored/OS
// preference.
function isThemedRoute(pathname) {
  return pathname.startsWith("/dashboard");
}

function getPreferredTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable — fall through to system preference
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getPreferredTheme);
  const { pathname } = useLocation();
  const onThemedRoute = isThemedRoute(pathname);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", onThemedRoute && theme === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable (private mode, quota, etc.) — fail silently
    }
  }, [theme, onThemedRoute]);

  // Follow the OS theme until the person makes an explicit choice.
  useEffect(() => {
    let hasStoredPreference = false;
    try {
      hasStoredPreference = window.localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      hasStoredPreference = false;
    }
    if (hasStoredPreference) return undefined;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => setTheme(event.matches ? "dark" : "light");
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, isDark: theme === "dark", setTheme, toggleTheme }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside a ThemeProvider");
  return ctx;
}
