import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { getToken } from "@/lib/auth";
import { requestPermissions, setupAndroidChannel } from "@/lib/notifications";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    (async () => {
      await setupAndroidChannel();
      await requestPermissions();
      const token = await getToken();
      setReady(true);
      if (token) router.replace("/(tabs)");
      else router.replace("/(auth)/login");
    })();
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
