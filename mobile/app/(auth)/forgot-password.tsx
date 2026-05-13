import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";

export default function ForgotPasswordScreen() {
  const t = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) { Alert.alert("Ingresá tu email"); return; }
    setLoading(true);
    try {
      await fetch(`${BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      Alert.alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const s = styles(t);
  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.card}>
        {sent ? (
          <>
            <Text style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>📬</Text>
            <Text style={s.cardTitle}>Email enviado</Text>
            <Text style={s.body}>Si existe una cuenta con ese email, vas a recibir un enlace para restablecer tu contraseña.</Text>
            <TouchableOpacity style={s.btn} onPress={() => router.back()}>
              <Text style={s.btnText}>Volver</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.cardTitle}>Olvidé mi contraseña</Text>
            <Text style={s.body}>Ingresá tu email y te enviamos un enlace.</Text>
            <Text style={s.label}>EMAIL</Text>
            <TextInput style={s.input} placeholder="tu@email.com" placeholderTextColor={t.muted}
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={[s.btn, { marginTop: 20 }]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color={t.card} /> : <Text style={s.btnText}>Enviar enlace</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[s.body, { textAlign: "center", color: t.salmon, fontWeight: "700", marginTop: 16 }]}>Volver</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: t.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", backgroundColor: t.card, borderRadius: 20, padding: 24, borderWidth: 1.5, borderColor: t.border },
  cardTitle: { fontSize: 18, fontWeight: "700", color: t.text, marginBottom: 8 },
  body: { fontSize: 14, color: t.muted, lineHeight: 20, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: t.muted, textTransform: "uppercase", marginBottom: 6 },
  input: { backgroundColor: t.input, borderWidth: 1.5, borderColor: t.border, borderRadius: 14, padding: 12, fontSize: 16, color: t.text },
  btn: { backgroundColor: t.text, borderRadius: 14, padding: 14, alignItems: "center" },
  btnText: { color: t.card, fontWeight: "700", fontSize: 16 },
});
