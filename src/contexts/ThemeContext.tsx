"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_MODE, DEFAULT_PALETTE, getThemeVars, PALETTES, type Mode, type PaletteId } from "@/lib/themes";

type Ctx = { palette: PaletteId; mode: Mode; setPalette: (p: PaletteId) => void; toggleMode: () => void };

const ThemeContext = createContext<Ctx>({ palette: DEFAULT_PALETTE, mode: DEFAULT_MODE, setPalette: () => {}, toggleMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteId>(DEFAULT_PALETTE);
  const [mode, setModeState] = useState<Mode>(DEFAULT_MODE);

  useEffect(() => {
    const savedPalette = localStorage.getItem("theme-palette") as PaletteId | null;
    const savedMode = localStorage.getItem("theme-mode") as Mode | null;
    if (savedPalette && PALETTES.find(p => p.id === savedPalette)) setPaletteState(savedPalette);
    if (savedMode === "light" || savedMode === "dark") setModeState(savedMode);
  }, []);

  useEffect(() => {
    const vars = getThemeVars(palette, mode);
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute("data-mode", mode);
  }, [palette, mode]);

  const setPalette = (p: PaletteId) => { setPaletteState(p); localStorage.setItem("theme-palette", p); };
  const toggleMode  = () => {
    const next: Mode = mode === "light" ? "dark" : "light";
    setModeState(next);
    localStorage.setItem("theme-mode", next);
  };

  return <ThemeContext.Provider value={{ palette, mode, setPalette, toggleMode }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
