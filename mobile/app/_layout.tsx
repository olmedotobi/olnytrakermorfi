import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/lib/theme-context";
import { useThemeCtx } from "@/lib/theme-context";
import { setupAndroidChannel, requestPermissions } from "@/lib/notifications";

function InnerLayout() {
  const { mode } = useThemeCtx();

  useEffect(() => {
    setupAndroidChannel().catch(() => {});
    requestPermissions().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <InnerLayout />
    </ThemeProvider>
  );
}
