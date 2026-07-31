import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "ref-theme-mode";

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: "light",
  toggleMode: () => {},
});

const applyMode = (mode: ThemeMode) => {
  document.documentElement.setAttribute("data-theme", mode);
};

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === "light" || stored === "dark") {
      setMode(stored);
      applyMode(stored);
    } else {
      applyMode("light");
    }
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const next: ThemeMode = prev === "light" ? "dark" : "light";
      window.localStorage.setItem(STORAGE_KEY, next);
      applyMode(next);
      return next;
    });
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);
