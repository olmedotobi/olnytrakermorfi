import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { apiGet, apiPost } from "@/lib/api";
import { getUser, clearSession } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Profile = { height: number; weight: number; age: number; gender: string; targetWeight: number; activityLevel: ActivityLevel };

const ACTIVITY: { value: ActivityLevel; label: string; sub: string }[] = [
  { value: "sedentary",   label: "Sedentario",  sub: "sin ejercicio" },
  { value: "light",       label: "Ligero",       sub: "1–3 días / semana" },
  { value: "moderate",    label: "Moderado",     sub: "3–5 días / semana" },
  { value: "active",      label: "Activo",       sub: "6–7 días / semana" },
  { value: "very_active", label: "Muy Activo",   sub: "2 veces / día" },
];

const ACTIVITY_MULT: Record<ActivityLevel, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};

function calcBMR(weight: number, height: number, age: number, gender: string) {
  return 10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161);
}

export default function ProfileScreen() {
  const t = useTheme();
  const [userName, setUserName] = useState("");
  const [form, setForm] = useState({
    height: "", weight: "", age: "", gender: "male",
    targetWeight: "", activityLevel: "moderate" as ActivityLevel,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const user = await getUser();
    setUserName(user?.name ?? "");
    const p = await apiGet<Profile | null>("/api/profile");
    if (p) {
      setForm({
        height: String(p.height), weight: String(p.weight), age: String(p.age),
        gender: p.gender, targetWeight: String(p.targetWeight), activityLevel: p.activityLevel,
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: string) => (val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.height || !form.weight || !form.age) {
      Alert.alert("Completá todos los campos obligatorios"); return;
    }
    setSaving(true);
    await apiPost("/api/profile", {
      height: Number(form.height), weight: Number(form.weight), age: Number(form.age),
      gender: form.gender, targetWeight: Number(form.targetWeight), activityLevel: form.activityLevel,
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Querés salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: async () => {
        await clearSession();
        router.replace("/(auth)/login");
      }},
    ]);
  };

  // Calculated stats
  const w = Number(form.weight), h = Number(form.height), a = Number(form.age), tw = Number(form.targetWeight);
  const hasData = w > 0 && h > 0 && a > 0;
  const bmr = hasData ? calcBMR(w, h, a, form.gender) : 0;
  const tdee = hasData ? Math.round(bmr * ACTIVITY_MULT[form.activityLevel]) : 0;
  const protein = hasData ? Math.round((tdee * 0.25) / 4) : 0;
  const carbs   = hasData ? Math.round((tdee * 0.45) / 4) : 0;
  const fat     = hasData ? Math.round((tdee * 0.3) / 9) : 0;
  const weightDiff = w > 0 && tw > 0 ? Math.abs(w - tw) : 0;
  const weeks = Math.round(weightDiff / 0.45);
  const losing = w > tw;

  const s = styles(t);
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Perfil</Text>
            {userName ? <Text style={s.subtitle}>{userName}</Text> : null}
          </View>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={t.danger} />
            <Text style={[s.logoutText, { color: t.danger }]}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Personal data */}
        <View style={s.card}>
          <Text style={s.cardLabel}>DATOS PERSONALES</Text>
          <View style={s.grid2}>
            {[
              { key: "height", label: "ALTURA (CM)", placeholder: "180" },
              { key: "weight", label: "PESO ACTUAL (KG)", placeholder: "70" },
              { key: "age",    label: "EDAD",         placeholder: "25" },
              { key: "targetWeight", label: "PESO OBJETIVO (KG)", placeholder: "65" },
            ].map(f => (
              <View key={f.key}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={s.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={t.muted}
                  value={form[f.key as keyof typeof form] as string}
                  onChangeText={set(f.key)}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>

          <Text style={[s.fieldLabel, { marginTop: 14 }]}>GÉNERO</Text>
          <View style={s.genderRow}>
            {(["male", "female"] as const).map(g => (
              <TouchableOpacity
                key={g}
                style={[s.genderBtn, form.gender === g && { backgroundColor: t.text, borderColor: t.text }]}
                onPress={() => setForm(p => ({ ...p, gender: g }))}
              >
                <Text style={[s.genderBtnText, form.gender === g && { color: t.card }]}>
                  {g === "male" ? "Masculino" : "Femenino"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity level */}
        <View style={s.card}>
          <Text style={s.cardLabel}>NIVEL DE ACTIVIDAD</Text>
          {ACTIVITY.map(a => {
            const sel = form.activityLevel === a.value;
            return (
              <TouchableOpacity
                key={a.value}
                style={[s.activityBtn, sel && { backgroundColor: t.text }]}
                onPress={() => setForm(p => ({ ...p, activityLevel: a.value }))}
              >
                <Text style={[s.activityLabel, sel && { color: t.card }]}>{a.label}</Text>
                <Text style={[s.activitySub, sel && { color: t.card, opacity: 0.65 }]}>{a.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Calculated stats */}
        {hasData && (
          <View style={s.card}>
            <Text style={s.cardLabel}>TU METABOLISMO CALCULADO</Text>
            <View style={s.statsGrid}>
              {[
                { label: "CALORÍAS", value: tdee - 500, unit: "kcal/d", color: t.salmon },
                { label: "PROTEÍNA", value: protein, unit: "g", color: t.lavender },
                { label: "CARBOS",   value: carbs,   unit: "g", color: t.warning },
                { label: "GRASAS",   value: fat,     unit: "g", color: t.salmon },
              ].map(m => (
                <View key={m.label} style={[s.statBox, { borderColor: t.border }]}>
                  <Text style={[s.statLabel, { color: m.color }]}>{m.label}</Text>
                  <Text style={s.statValue}>{m.value}</Text>
                  <Text style={[s.statUnit, { color: m.color }]}>{m.unit}</Text>
                </View>
              ))}
            </View>
            <Text style={[s.hint, { color: t.muted }]}>
              BMR: {Math.round(bmr)} kcal/d · TDEE: {tdee} kcal/d · déficit 500
            </Text>

            {weightDiff > 0 && (
              <View style={[s.goalBox, { borderColor: t.border, backgroundColor: t.input }]}>
                <Text style={[s.goalTitle, { color: t.text }]}>
                  {losing ? "Bajar" : "Subir"} {weightDiff.toFixed(1)} kg
                </Text>
                <Text style={[s.goalSub, { color: t.muted }]}>
                  A ritmo actual llegarías en {weeks} semanas
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Save button */}
        <TouchableOpacity style={[s.saveBtn, { backgroundColor: t.text }]} onPress={handleSave} disabled={saving}>
          <Text style={[s.saveBtnText, { color: t.card }]}>
            {saving ? "Guardando..." : saved ? "Guardado ✓" : "Actualizar perfil"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Imported at runtime only (not tree-shaken from expo-vector-icons)
import { Ionicons } from "@expo/vector-icons";

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: t.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: t.muted, marginTop: 2 },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 5, padding: 8, borderRadius: 10, borderWidth: 1.5, borderColor: t.border },
  logoutText: { fontSize: 13, fontWeight: "600" },
  card: { backgroundColor: t.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: t.border },
  cardLabel: { fontSize: 10, fontWeight: "700", color: t.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 },
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  fieldLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1, color: t.muted, textTransform: "uppercase", marginBottom: 6 },
  input: { backgroundColor: t.input, borderWidth: 1.5, borderColor: t.border, borderRadius: 12, padding: 11, fontSize: 15, color: t.text, width: "47%", minWidth: 130 },
  genderRow: { flexDirection: "row", gap: 10, marginTop: 2 },
  genderBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: t.border, alignItems: "center" },
  genderBtnText: { fontSize: 14, fontWeight: "600", color: t.text },
  activityBtn: { borderRadius: 12, padding: 14, marginBottom: 6, backgroundColor: t.input },
  activityLabel: { fontSize: 14, fontWeight: "600", color: t.text },
  activitySub: { fontSize: 12, color: t.muted, marginTop: 2 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  statBox: { width: "47%", borderWidth: 1.5, borderRadius: 14, padding: 14, minWidth: 130 },
  statLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: "900", color: t.text, lineHeight: 28 },
  statUnit: { fontSize: 12, fontWeight: "400", marginTop: 2 },
  hint: { fontSize: 11, marginTop: 2 },
  goalBox: { borderWidth: 1.5, borderRadius: 14, padding: 16, marginTop: 10 },
  goalTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  goalSub: { fontSize: 13, marginTop: 4 },
  saveBtn: { marginHorizontal: 16, marginTop: 4, borderRadius: 16, padding: 15, alignItems: "center" },
  saveBtnText: { fontWeight: "700", fontSize: 16 },
});
