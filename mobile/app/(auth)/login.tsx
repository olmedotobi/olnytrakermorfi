import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { saveSession } from "@/lib/auth";
import { useGoogleAuth, loginWithGoogleToken } from "@/lib/google-auth";
import { useTheme } from "@/lib/theme";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";

export default function LoginScreen() {
  const t = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [webCode, setWebCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  const { request, response, promptAsync } = useGoogleAuth();

  const handleWebCode = async () => {
    const trimmed = webCode.trim().replace(/\s/g, "");
    if (trimmed.length !== 6) { Alert.alert("El código debe tener 6 dígitos"); return; }
    setCodeLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/mobile-code/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Error", data.error ?? "Código inválido"); return; }
      await saveSession(data.token, data.user);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error de conexión");
    } finally {
      setCodeLoading(false);
    }
  };

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.authentication ?? {};
      if (!access_token) { Alert.alert("Error con Google"); return; }
      setGoogleLoading(true);
      loginWithGoogleToken(access_token)
        .then(data => { saveSession(data.token, data.user); router.replace("/(tabs)"); })
        .catch(() => Alert.alert("Error", "No se pudo iniciar sesión con Google"))
        .finally(() => setGoogleLoading(false));
    } else if (response?.type === "error") {
      Alert.alert("Error con Google", response.error?.message ?? "Intentá de nuevo");
    }
  }, [response]);

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
      if (!res.ok) {
        if (data.error?.includes("Google")) {
          Alert.alert(
            "Cuenta Google",
            "Esta cuenta usa Google. Tocá 'Continuar con Google' arriba para ingresar.",
          );
        } else {
          Alert.alert("Error", data.error ?? "Credenciales incorrectas");
        }
        return;
      }
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
      <Image source={require("../../assets/icon.png")} style={s.logo} />
      <Text style={s.title}>Onlytracker <Text style={s.titleItalic}>Morfi</Text></Text>
      <Text style={s.subtitle}>tu tracker nutricional</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>Iniciar sesión</Text>

        {/* Google button */}
        <TouchableOpacity
          style={s.googleBtn}
          onPress={() => promptAsync()}
          disabled={!request || googleLoading}
        >
          {googleLoading
            ? <ActivityIndicator color={t.text} size="small" />
            : <>
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={[s.googleBtnText, { color: t.text }]}>Continuar con Google</Text>
              </>
          }
        </TouchableOpacity>

        {/* Web code */}
        <TouchableOpacity style={s.codeToggleBtn} onPress={() => setShowCodeInput(v => !v)}>
          <Ionicons name="phone-portrait-outline" size={16} color={t.muted} />
          <Text style={[s.codeToggleText, { color: t.muted }]}>
            {showCodeInput ? "Ocultar código" : "Tengo un código de la web"}
          </Text>
        </TouchableOpacity>

        {showCodeInput && (
          <View style={[s.codeBox, { borderColor: t.border, backgroundColor: t.input }]}>
            <Text style={[s.label, { marginBottom: 8 }]}>CÓDIGO DE 6 DÍGITOS</Text>
            <View style={[s.inputWrap, { borderColor: t.border, backgroundColor: t.card, marginBottom: 10 }]}>
              <TextInput
                style={[s.input, s.codeInput, { color: t.text }]}
                placeholder="123456"
                placeholderTextColor={t.muted}
                value={webCode}
                onChangeText={v => setWebCode(v.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <TouchableOpacity style={[s.btn, { backgroundColor: t.text, marginBottom: 0 }]} onPress={handleWebCode} disabled={codeLoading}>
              {codeLoading
                ? <ActivityIndicator color={t.card} size="small" />
                : <Text style={[s.btnText, { color: t.card }]}>Ingresar con código</Text>
              }
            </TouchableOpacity>
            <Text style={[s.codeHint, { color: t.muted }]}>
              Generá el código en la web: Perfil → Código para mobile
            </Text>
          </View>
        )}

        <View style={s.divider}>
          <View style={[s.dividerLine, { backgroundColor: t.border }]} />
          <Text style={[s.dividerText, { color: t.muted }]}>o</Text>
          <View style={[s.dividerLine, { backgroundColor: t.border }]} />
        </View>

        <Text style={s.label}>EMAIL</Text>
        <View style={[s.inputWrap, { borderColor: t.border, backgroundColor: t.input }]}>
          <TextInput style={[s.input, { color: t.text }]} placeholder="tu@email.com" placeholderTextColor={t.muted}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        </View>

        <Text style={[s.label, { marginTop: 14 }]}>CONTRASEÑA</Text>
        <View style={[s.inputWrap, { borderColor: t.border, backgroundColor: t.input }]}>
          <TextInput style={[s.input, { color: t.text }]} placeholder="••••••••" placeholderTextColor={t.muted}
            value={password} onChangeText={setPassword} secureTextEntry autoCorrect={false} />
        </View>

        <TouchableOpacity style={s.forgotBtn} onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={[s.forgotText, { color: t.muted }]}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn, { backgroundColor: t.text }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={t.card} /> : <Text style={[s.btnText, { color: t.card }]}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={[s.link, { color: t.muted }]}>¿No tenés cuenta? <Text style={[s.linkBold, { color: t.salmon }]}>Crear cuenta</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: t.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: t.text, textAlign: "center", letterSpacing: -0.5, marginBottom: 4 },
  titleItalic: { fontStyle: "italic", fontWeight: "400" },
  subtitle: { fontSize: 14, color: t.muted, marginBottom: 32 },
  card: { width: "100%", backgroundColor: t.card, borderRadius: 20, padding: 24, borderWidth: 1.5, borderColor: t.border },
  cardTitle: { fontSize: 18, fontWeight: "700", color: t.text, marginBottom: 20 },
  googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1.5, borderColor: t.border, borderRadius: 14, padding: 13, backgroundColor: t.input, marginBottom: 16 },
  googleBtnText: { fontSize: 15, fontWeight: "600" },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: t.muted, textTransform: "uppercase", marginBottom: 6 },
  inputWrap: { borderWidth: 1.5, borderRadius: 14, marginBottom: 4 },
  input: { padding: 12, fontSize: 16 },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 16, marginTop: 4 },
  forgotText: { fontSize: 13 },
  btn: { borderRadius: 14, padding: 14, alignItems: "center", marginBottom: 16 },
  btnText: { fontWeight: "700", fontSize: 16 },
  link: { textAlign: "center", fontSize: 13 },
  linkBold: { fontWeight: "700" },
  codeToggleBtn: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 12, padding: 4 },
  codeToggleText: { fontSize: 13 },
  codeBox: { borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 16 },
  codeInput: { textAlign: "center", fontSize: 24, fontWeight: "700", letterSpacing: 8 },
  codeHint: { fontSize: 11, textAlign: "center", marginTop: 8, lineHeight: 16 },
});
