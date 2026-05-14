import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from "react-native";
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
      if (!loginRes.ok) { Alert.alert("Listo", "Cuenta configurada. Iniciá sesión."); router.back(); return; }
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Image source={require("../../assets/icon.png")} style={s.logo} />
      <Text style={s.title}>Onlytracker <Text style={s.titleItalic}>Morfi</Text></Text>
      <Text style={s.subtitle}>tu tracker nutricional</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>Crear cuenta</Text>
        <View style={s.hint}>
          <Text style={[s.hintText, { color: t.muted }]}>
            Si ya usás la web con Google, ingresá el mismo email y elegí una contraseña para mobile.
          </Text>
        </View>

        <Text style={s.label}>NOMBRE</Text>
        <View style={[s.inputWrap, { borderColor: t.border, backgroundColor: t.input }]}>
          <TextInput style={[s.input, { color: t.text }]} placeholder="Juan García" placeholderTextColor={t.muted}
            value={name} onChangeText={setName} autoCapitalize="words" />
        </View>

        <Text style={[s.label, { marginTop: 14 }]}>EMAIL</Text>
        <View style={[s.inputWrap, { borderColor: t.border, backgroundColor: t.input }]}>
          <TextInput style={[s.input, { color: t.text }]} placeholder="tu@email.com" placeholderTextColor={t.muted}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        </View>

        <Text style={[s.label, { marginTop: 14 }]}>CONTRASEÑA</Text>
        <View style={[s.inputWrap, { borderColor: t.border, backgroundColor: t.input, marginBottom: 20 }]}>
          <TextInput style={[s.input, { color: t.text }]} placeholder="Mínimo 6 caracteres" placeholderTextColor={t.muted}
            value={password} onChangeText={setPassword} secureTextEntry autoCorrect={false} />
        </View>

        <TouchableOpacity style={[s.btn, { backgroundColor: t.text }]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color={t.card} /> : <Text style={[s.btnText, { color: t.card }]}>Continuar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.link, { color: t.muted }]}>¿Ya tenés cuenta? <Text style={[s.linkBold, { color: t.salmon }]}>Iniciar sesión</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: t.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: t.text, textAlign: "center", letterSpacing: -0.5, marginBottom: 4 },
  titleItalic: { fontStyle: "italic", fontWeight: "400" },
  subtitle: { fontSize: 14, color: t.muted, marginBottom: 32 },
  card: { width: "100%", backgroundColor: t.card, borderRadius: 20, padding: 24, borderWidth: 1.5, borderColor: t.border },
  cardTitle: { fontSize: 18, fontWeight: "700", color: t.text, marginBottom: 10 },
  hint: { backgroundColor: t.input, borderRadius: 12, padding: 12, marginBottom: 20 },
  hintText: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: t.muted, textTransform: "uppercase", marginBottom: 6 },
  inputWrap: { borderWidth: 1.5, borderRadius: 14, marginBottom: 4 },
  input: { padding: 12, fontSize: 16 },
  btn: { borderRadius: 14, padding: 14, alignItems: "center", marginBottom: 16 },
  btnText: { fontWeight: "700", fontSize: 16 },
  link: { textAlign: "center", fontSize: 13 },
  linkBold: { fontWeight: "700" },
});
