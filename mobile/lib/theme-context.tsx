import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { useColorScheme } from "react-native";
import {
  DEFAULT_MODE, DEFAULT_PALETTE, getTheme, PALETTES,
  type ColorMode, type PaletteId, type ThemeColors,
} from "./themes";

type Ctx = {
  colors: ThemeColors;
  paletteId: PaletteId;
  mode: ColorMode;
  setPalette: (id: PaletteId) => void;
  toggleMode: () => void;
  setExplicitMode: (m: ColorMode) => void;
  useSystemMode: boolean;
  setUseSystemMode: (v: boolean) => void;
};

const ThemeCtx = createContext<Ctx>({
  colors: getTheme(DEFAULT_PALETTE, DEFAULT_MODE),
  paletteId: DEFAULT_PALETTE,
  mode: DEFAULT_MODE,
  setPalette: () => {},
  toggleMode: () => {},
  setExplicitMode: () => {},
  useSystemMode: true,
  setUseSystemMode: () => {},
});

const KEY_PALETTE = "theme_palette";
const KEY_MODE    = "theme_mode";
const KEY_SYSTEM  = "theme_system";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [paletteId, setPaletteId] = useState<PaletteId>(DEFAULT_PALETTE);
  const [mode, setMode] = useState<ColorMode>(DEFAULT_MODE);
  const [useSystemMode, setUseSystemModeState] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync(KEY_PALETTE),
      SecureStore.getItemAsync(KEY_MODE),
      SecureStore.getItemAsync(KEY_SYSTEM),
    ]).then(([p, m, sys]) => {
      if (p && PALETTES.find(x => x.id === p)) setPaletteId(p as PaletteId);
      if (m === "light" || m === "dark") setMode(m);
      if (sys === "false") setUseSystemModeState(false);
      setReady(true);
    });
  }, []);

  // When system mode is on, follow the device
  const effectiveMode: ColorMode = useSystemMode
    ? (systemScheme === "dark" ? "dark" : "light")
    : mode;

  const colors = getTheme(paletteId, effectiveMode);

  const setPalette = (id: PaletteId) => {
    setPaletteId(id);
    SecureStore.setItemAsync(KEY_PALETTE, id);
  };

  const toggleMode = () => {
    const next: ColorMode = effectiveMode === "light" ? "dark" : "light";
    setMode(next);
    setUseSystemModeState(false);
    SecureStore.setItemAsync(KEY_MODE, next);
    SecureStore.setItemAsync(KEY_SYSTEM, "false");
  };

  const setExplicitMode = (m: ColorMode) => {
    setMode(m);
    setUseSystemModeState(false);
    SecureStore.setItemAsync(KEY_MODE, m);
    SecureStore.setItemAsync(KEY_SYSTEM, "false");
  };

  const setUseSystemMode = (v: boolean) => {
    setUseSystemModeState(v);
    SecureStore.setItemAsync(KEY_SYSTEM, String(v));
  };

  if (!ready) return null;

  return (
    <ThemeCtx.Provider value={{ colors, paletteId, mode: effectiveMode, setPalette, toggleMode, setExplicitMode, useSystemMode, setUseSystemMode }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useThemeCtx = () => useContext(ThemeCtx);
