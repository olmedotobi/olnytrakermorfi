import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { getToken } from "@/lib/auth";

export default function Index() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getToken()
      .then(t => setToken(t ?? null))
      .catch(() => setToken(null));
  }, []);

  if (token === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9F6F1", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#E8704A" />
      </View>
    );
  }

  if (token) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
