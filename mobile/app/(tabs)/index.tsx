import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiGet, apiDelete } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

type Profile = { weight: number; height: number; age: number; gender: string; activityLevel: string; targetWeight: number };
type FoodEntry = { id: string; foodName: string; calories: number; protein: number; carbs: number; fat: number; mealType: string; grams: number };

const ACTIVITY_MULT: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};
const MEALS = ["Desayuno", "Almuerzo", "Cena", "Snack", "Merienda"] as const;
const MEAL_ICONS: Record<string, string> = {
  Desayuno: "☀️", Almuerzo: "🍽️", Cena: "🌙", Snack: "🍎", Merienda: "🫖",
};

const QUOTES = [
  "El progreso vive entre la disciplina y el descanso.",
  "Cada comida es una oportunidad de nutrir tu cuerpo.",
  "Lo que hacés hoy define cómo te sentís mañana.",
  "La constancia supera al talento, siempre.",
  "Un paso a la vez, una comida a la vez.",
  "Tu cuerpo es tu proyecto más importante.",
  "Comer bien no es una restricción, es un regalo.",
  "No se trata de perfección, se trata de consistencia.",
];

function today() { return new Date().toISOString().slice(0, 10); }
function todayLabel() {
  return new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}
function calcCalGoal(p: Profile) {
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.gender === "male" ? 5 : -161);
  const tdee = bmr * (ACTIVITY_MULT[p.activityLevel] ?? 1.55);
  return Math.round(tdee - 500);
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const t = useTheme();
  const pct = Math.min(value / Math.max(max, 1), 1);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 9, fontWeight: "700", color: t.muted, letterSpacing: 0.8 }}>{label}</Text>
        <Text style={{ fontSize: 9, fontWeight: "700", color }}>{Math.round(value)}g</Text>
      </View>
      <View style={{ height: 5, backgroundColor: t.border, borderRadius: 99 }}>
        <View style={{ width: `${pct * 100}%`, height: 5, backgroundColor: color, borderRadius: 99 }} />
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const t = useTheme();
  const [userName, setUserName] = useState("");
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const load = useCallback(async () => {
    const user = await getUser();
    setUserName(user?.name?.split(" ")[0] ?? "");
    const [e, p] = await Promise.all([
      apiGet<FoodEntry[]>(`/api/food-entries?date=${today()}`),
      apiGet<Profile | null>("/api/profile"),
    ]);
    setEntries(Array.isArray(e) ? e : []);
    setProfile(p ?? null);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = useCallback(async () => { setRefreshing(true); await load(); setRefreshing(false); }, [load]);

  const deleteEntry = async (id: string) => {
    await apiDelete(`/api/food-entries?id=${id}`);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const totals = entries.reduce(
    (a, e) => ({ cal: a.cal + e.calories, prot: a.prot + e.protein, carbs: a.carbs + e.carbs, fat: a.fat + e.fat }),
    { cal: 0, prot: 0, carbs: 0, fat: 0 },
  );
  const goal = profile ? calcCalGoal(profile) : 2000;
  const remaining = Math.max(goal - Math.round(totals.cal), 0);
  const over = Math.round(totals.cal) > goal;
  const calPct = Math.min(totals.cal / goal, 1);
  const weightDiff = profile ? Math.abs(profile.weight - profile.targetWeight) : 0;
  const protGoal = profile ? profile.weight * 2 : 150;
  const carbGoal = goal * 0.45 / 4;
  const fatGoal = goal * 0.3 / 9;

  const byMeal = entries.reduce((acc, e) => {
    (acc[e.mealType] ??= []).push(e);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  const s = styles(t);
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.salmon} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.dateLabel}>{todayLabel()}</Text>
          <Text style={s.greeting}>
            ¡Hola{userName ? ", " : ""}<Text style={s.greetingName}>{userName}</Text>! {over ? "🚨" : "👋"}
          </Text>
          <Text style={s.subGreeting}>
            Hoy llevás <Text style={{ color: t.text, fontWeight: "700" }}>{Math.round(totals.cal)} kcal</Text> de tu objetivo de {goal}. {over ? "Límite alcanzado 🚨" : "Vas bien 🌱"}
          </Text>
        </View>

        {/* Quote */}
        <View style={s.quoteCard}>
          <Text style={s.quoteText}>✦ {quote}</Text>
        </View>

        {/* Calorie progress card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>CALORÍAS DE HOY</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 6 }}>
            <Text style={s.bigCal}>{Math.round(totals.cal).toLocaleString("es-AR")}</Text>
            <Text style={s.kcalUnit}> kcal</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, {
              width: `${calPct * 100}%`,
              backgroundColor: over ? t.danger : calPct > 0.85 ? t.warning : t.mint,
            }]} />
          </View>
          <Text style={s.progressSub}>
            {goal.toLocaleString("es-AR")} kcal objetivo · {Math.round(calPct * 100)}%
          </Text>
        </View>

        {/* Stat grid */}
        <View style={s.statGrid}>
          <View style={[s.statCard, { backgroundColor: t.salmonBg }]}>
            <Text style={[s.statLabel, { color: t.salmon }]}>CONSUMIDAS</Text>
            <Text style={[s.statValue, { color: t.text }]}>{Math.round(totals.cal)}</Text>
            <Text style={[s.statUnit, { color: t.salmon }]}>kcal</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: t.mintBg }]}>
            <Text style={[s.statLabel, { color: t.mint }]}>RESTANTES</Text>
            <Text style={[s.statValue, { color: t.text }]}>{remaining}</Text>
            <Text style={[s.statUnit, { color: t.mint }]}>kcal</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: t.lavenderBg }]}>
            <Text style={[s.statLabel, { color: t.lavender }]}>META DIARIA</Text>
            <Text style={[s.statValue, { color: t.text }]}>{goal}</Text>
            <Text style={[s.statUnit, { color: t.lavender }]}>kcal</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: t.input }]}>
            <Text style={[s.statLabel, { color: t.muted }]}>PARA META</Text>
            <Text style={[s.statValue, { color: t.text }]}>{weightDiff.toFixed(1)}</Text>
            <Text style={[s.statUnit, { color: t.muted }]}>kg</Text>
          </View>
        </View>

        {/* Macros */}
        <View style={s.card}>
          <Text style={s.cardLabel}>MACRONUTRIENTES</Text>
          <View style={{ gap: 12 }}>
            <MacroBar label="PROTEÍNA" value={totals.prot} max={protGoal} color={t.lavender} />
            <MacroBar label="CARBOHIDRATOS" value={totals.carbs} max={carbGoal} color={t.warning} />
            <MacroBar label="GRASAS" value={totals.fat} max={fatGoal} color={t.salmon} />
          </View>
        </View>

        {/* No profile warning */}
        {!profile && (
          <View style={[s.warnCard, { borderColor: t.salmon, backgroundColor: t.salmonBg }]}>
            <Ionicons name="warning-outline" size={16} color={t.salmon} />
            <Text style={[s.warnText, { color: t.salmon }]}>
              Completá tu perfil para calcular tus calorías personalizadas.
            </Text>
          </View>
        )}

        {/* Quick add */}
        <TouchableOpacity style={[s.quickAdd, { backgroundColor: t.text }]} onPress={() => router.push("/(tabs)/foods")}>
          <Ionicons name="add-circle-outline" size={20} color={t.card} />
          <Text style={[s.quickAddText, { color: t.card }]}>Agregar alimento</Text>
        </TouchableOpacity>

        {/* Food entries by meal */}
        {MEALS.filter(m => byMeal[m]?.length).map(meal => (
          <View key={meal} style={s.card}>
            <View style={s.mealHeader}>
              <Text style={s.mealIcon}>{MEAL_ICONS[meal]}</Text>
              <Text style={s.mealTitle}>{meal}</Text>
              <Text style={[s.mealKcal, { color: t.muted }]}>
                {Math.round(byMeal[meal].reduce((a, e) => a + e.calories, 0))} kcal
              </Text>
            </View>
            {byMeal[meal].map(e => (
              <View key={e.id} style={s.entryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.entryName} numberOfLines={1}>{e.foodName}</Text>
                  <Text style={s.entryMeta}>{e.grams}g · {Math.round(e.protein)}p {Math.round(e.carbs)}c {Math.round(e.fat)}g</Text>
                </View>
                <Text style={s.entryKcal}>{Math.round(e.calories)} kcal</Text>
                <TouchableOpacity onPress={() => deleteEntry(e.id)} style={s.delBtn}>
                  <Ionicons name="close" size={14} color={t.muted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        {entries.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🍃</Text>
            <Text style={[s.emptyText, { color: t.muted }]}>Sin registros hoy.</Text>
            <Text style={[s.emptyText, { color: t.muted }]}>Tocá "Agregar alimento" para empezar.</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  dateLabel: { fontSize: 12, color: t.muted, textTransform: "capitalize", marginBottom: 4, fontWeight: "600", letterSpacing: 0.5 },
  greeting: { fontSize: 26, fontWeight: "900", color: t.text, letterSpacing: -0.5, lineHeight: 32, marginBottom: 6 },
  greetingName: { fontStyle: "italic", fontWeight: "400" },
  subGreeting: { fontSize: 13, color: t.muted, lineHeight: 18 },
  quoteCard: { marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 14, backgroundColor: t.input, borderWidth: 1, borderColor: t.border },
  quoteText: { fontSize: 12, color: t.muted, fontStyle: "italic", lineHeight: 18 },
  card: { backgroundColor: t.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: t.border },
  cardLabel: { fontSize: 9, fontWeight: "700", color: t.muted, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 10 },
  bigCal: { fontSize: 42, fontWeight: "900", color: t.text, letterSpacing: -1 },
  kcalUnit: { fontSize: 16, fontWeight: "400", color: t.muted, marginBottom: 8 },
  progressTrack: { height: 8, backgroundColor: t.border, borderRadius: 99, marginBottom: 8, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 99 },
  progressSub: { fontSize: 11, color: t.muted },
  statGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: 16, gap: 10, marginBottom: 12 },
  statCard: { width: "47%", borderRadius: 16, padding: 16, flexGrow: 1 },
  statLabel: { fontSize: 8, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5, lineHeight: 30 },
  statUnit: { fontSize: 11, fontWeight: "400", marginTop: 2 },
  warnCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 14, borderWidth: 1.5, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  warnText: { fontSize: 13, flex: 1, lineHeight: 18 },
  quickAdd: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  quickAddText: { fontWeight: "700", fontSize: 16 },
  mealHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  mealIcon: { fontSize: 16 },
  mealTitle: { fontSize: 14, fontWeight: "700", color: t.text, flex: 1 },
  mealKcal: { fontSize: 12, fontWeight: "600" },
  entryRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: t.border },
  entryName: { fontSize: 14, fontWeight: "600", color: t.text },
  entryMeta: { fontSize: 11, color: t.muted, marginTop: 1 },
  entryKcal: { fontSize: 13, color: t.muted, fontWeight: "600", marginRight: 8 },
  delBtn: { padding: 6 },
  emptyCard: { alignItems: "center", paddingVertical: 32 },
  emptyText: { fontSize: 14, lineHeight: 20 },
});
