import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { saveSession } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";

export default function RegisterScreen() {
  const t = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert("Completá todos los campos"); return; }
    if (password.length < 6) { Alert.alert("La contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Error", data.error ?? "Error al crear cuenta"); return; }

      const loginRes = await fetch(`${BASE}/api/auth/mobile-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      await saveSession(loginData.token, loginData.user);
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
        <Text style={s.cardTitle}>Crear cuenta</Text>

        {[
          { label: "NOMBRE", value: name, setter: setName, placeholder: "Juan García", type: "default" as const },
          { label: "EMAIL", value: email, setter: setEmail, placeholder: "tu@email.com", type: "email-address" as const },
          { label: "CONTRASEÑA", value: password, setter: setPassword, placeholder: "Mínimo 6 caracteres", type: "default" as const, secure: true },
        ].map((f, i) => (
          <View key={f.label} style={{ marginBottom: i < 2 ? 14 : 20 }}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput style={s.input} placeholder={f.placeholder} placeholderTextColor={t.muted}
              value={f.value} onChangeText={f.setter} keyboardType={f.type}
              autoCapitalize={f.type === "email-address" ? "none" : "words"}
              secureTextEntry={f.secure} />
          </View>
        ))}

        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color={t.card} /> : <Text style={s.btnText}>Crear cuenta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.link}>¿Ya tenés cuenta? <Text style={s.linkBold}>Iniciar sesión</Text></Text>
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
  input: { backgroundColor: t.input, borderWidth: 1.5, borderColor: t.border, borderRadius: 14, padding: 12, fontSize: 16, color: t.text },
  btn: { backgroundColor: t.text, borderRadius: 14, padding: 14, alignItems: "center", marginBottom: 16 },
  btnText: { color: t.card, fontWeight: "700", fontSize: 16 },
  link: { textAlign: "center", fontSize: 13, color: t.muted },
  linkBold: { color: t.salmon, fontWeight: "700" },
});
