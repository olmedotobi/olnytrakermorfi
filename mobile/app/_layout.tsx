import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { setupAndroidChannel, requestPermissions } from "@/lib/notifications";

export default function RootLayout() {
  const scheme = useColorScheme();

  useEffect(() => {
    setupAndroidChannel().catch(() => {});
    requestPermissions().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
