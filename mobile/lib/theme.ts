import { useThemeCtx } from "./theme-context";
export type { ThemeColors as Theme } from "./themes";
export { PALETTES, type PaletteId, type ColorMode } from "./themes";
export { useThemeCtx } from "./theme-context";

// Backward-compatible hook: returns flat ThemeColors so all existing screens
// using `const t = useTheme(); t.bg; t.text` continue to work unchanged.
export function useTheme() {
  return useThemeCtx().colors;
}
