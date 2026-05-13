import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { saveSession } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";

export default function LoginScreen() {
  const t = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert("Completá todos los campos"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/mobile-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Error", data.error ?? "Credenciales incorrectas"); return; }
      await saveSession(data.token, data.user);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const s = styles(t);
  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Onlytracker{"\n"}<Text style={s.titleItalic}>Morfi</Text></Text>
      <Text style={s.subtitle}>tu tracker nutricional</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>Iniciar sesión</Text>

        <Text style={s.label}>EMAIL</Text>
        <TextInput style={s.input} placeholder="tu@email.com" placeholderTextColor={t.muted}
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={[s.label, { marginTop: 14 }]}>CONTRASEÑA</Text>
        <TextInput style={s.input} placeholder="••••••••" placeholderTextColor={t.muted}
          value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={s.forgotBtn} onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={s.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={t.card} /> : <Text style={s.btnText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={s.link}>¿No tenés cuenta? <Text style={s.linkBold}>Crear cuenta</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: t.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "800", color: t.text, textAlign: "center", letterSpacing: -1, marginBottom: 6 },
  titleItalic: { fontStyle: "italic", fontWeight: "400" },
  subtitle: { fontSize: 14, color: t.muted, marginBottom: 32 },
  card: { width: "100%", backgroundColor: t.card, borderRadius: 20, padding: 24, borderWidth: 1.5, borderColor: t.border },
  cardTitle: { fontSize: 18, fontWeight: "700", color: t.text, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: t.muted, textTransform: "uppercase", marginBottom: 6 },
  input: { backgroundColor: t.input, borderWidth: 1.5, borderColor: t.border, borderRadius: 14, padding: 12, fontSize: 16, color: t.text, marginBottom: 4 },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 16, marginTop: 4 },
  forgotText: { fontSize: 13, color: t.muted },
  btn: { backgroundColor: t.text, borderRadius: 14, padding: 14, alignItems: "center", marginBottom: 16 },
  btnText: { color: t.card, fontWeight: "700", fontSize: 16 },
  link: { textAlign: "center", fontSize: 13, color: t.muted },
  linkBold: { color: t.salmon, fontWeight: "700" },
});
