import { useColorScheme } from "react-native";

export const palette = {
  light: {
    bg: "#F9F6F1", card: "#FFFFFF", input: "#F3F0EB", border: "#EAE5DB",
    text: "#1C1917", muted: "#9C9485",
    salmon: "#E8704A", salmonBg: "#FEF0E9",
    mint: "#2DAA7E", mintBg: "#EBF8F2",
    lavender: "#7C6DC7", lavenderBg: "#EFECF8",
    warning: "#F59E0B", danger: "#EF4444", success: "#2DAA7E",
  },
  dark: {
    bg: "#1A1510", card: "#221C15", input: "#2A2318", border: "#3A2F24",
    text: "#F5F0E8", muted: "#8A7D6E",
    salmon: "#F0886A", salmonBg: "rgba(240,136,106,0.18)",
    mint: "#3DC48F", mintBg: "rgba(61,196,143,0.18)",
    lavender: "#9E90D9", lavenderBg: "rgba(158,144,217,0.18)",
    warning: "#F5A823", danger: "#F47070", success: "#3DC48F",
  },
} as const;

export type Theme = typeof palette.light;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return palette[scheme === "dark" ? "dark" : "light"];
}
