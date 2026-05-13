import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { apiGet } from "@/lib/api";
import { getUser, clearSession } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

type Profile = { weight: number; height: number; age: number; gender: string; activityLevel: string; targetWeight: number };
type FoodEntry = { id: string; foodName: string; calories: number; protein: number; carbs: number; fat: number; mealType: string };

function today() { return new Date().toISOString().slice(0, 10); }

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const t = useTheme();
  const pct = Math.min(value / max, 1);
  return (
    <View style={{ flex: 1, marginHorizontal: 4 }}>
      <Text style={{ fontSize: 9, fontWeight: "700", color: t.muted, textAlign: "center", marginBottom: 4, letterSpacing: 0.8 }}>{label}</Text>
      <View style={{ height: 5, backgroundColor: t.border, borderRadius: 99, marginBottom: 4 }}>
        <View style={{ width: `${pct * 100}%`, height: 5, backgroundColor: color, borderRadius: 99 }} />
      </View>
      <Text style={{ fontSize: 13, fontWeight: "800", color: t.text, textAlign: "center" }}>{Math.round(value)}<Text style={{ fontSize: 10, fontWeight: "400", color: t.muted }}>g</Text></Text>
    </View>
  );
}

export default function DashboardScreen() {
  const t = useTheme();
  const [userName, setUserName] = useState("");
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const user = await getUser();
    setUserName(user?.name?.split(" ")[0] ?? "");
    const [e, p] = await Promise.all([
      apiGet<FoodEntry[]>(`/api/food-entries?date=${today()}`),
      apiGet<Profile | null>("/api/profile"),
    ]);
    setEntries(Array.isArray(e) ? e : []);
    setProfile(p);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => { setRefreshing(true); await load(); setRefreshing(false); }, [load]);

  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + e.calories,
    protein: acc.protein + e.protein,
    carbs: acc.carbs + e.carbs,
    fat: acc.fat + e.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const calorieGoal = profile ? Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + (profile.gender === "male" ? 5 : -161)) * 1.55 : 2000;
  const calPct = Math.min(totals.calories / calorieGoal, 1);

  const s = styles(t);
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.salmon} />}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hola, {userName || "👋"}</Text>
            <Text style={s.date}>{new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}</Text>
          </View>
          <TouchableOpacity onPress={async () => { await clearSession(); router.replace("/(auth)/login"); }} style={s.logoutBtn}>
            <Text style={s.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Calorie ring card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>CALORÍAS DE HOY</Text>
          <Text style={s.bigCalorie}>{Math.round(totals.calories).toLocaleString()}<Text style={s.kcalUnit}> kcal</Text></Text>
          <View style={s.calorieBar}>
            <View style={[s.calorieBarFill, { width: `${calPct * 100}%`, backgroundColor: calPct > 1 ? t.danger : calPct > 0.85 ? t.warning : t.mint }]} />
          </View>
          <Text style={s.calorieGoalText}>{Math.round(calorieGoal).toLocaleString()} kcal objetivo · {Math.round(calPct * 100)}%</Text>

          <View style={s.macrosRow}>
            <MacroBar label="PROT" value={totals.protein} max={profile ? profile.weight * 2 : 150} color={t.lavender} />
            <MacroBar label="CARB" value={totals.carbs} max={calorieGoal * 0.5 / 4} color={t.warning} />
            <MacroBar label="GRASA" value={totals.fat} max={calorieGoal * 0.3 / 9} color={t.salmon} />
          </View>
        </View>

        {/* Quick add */}
        <TouchableOpacity style={s.quickAdd} onPress={() => router.push("/(tabs)/foods")}>
          <Text style={s.quickAddText}>＋ Agregar alimento</Text>
        </TouchableOpacity>

        {/* Today's entries */}
        {entries.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardLabel}>COMIDAS DE HOY</Text>
            {entries.map(e => (
              <View key={e.id} style={s.entryRow}>
                <Text style={s.entryName} numberOfLines={1}>{e.foodName}</Text>
                <Text style={s.entryKcal}>{Math.round(e.calories)} kcal</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  scroll: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 10 },
  greeting: { fontSize: 22, fontWeight: "800", color: t.text, letterSpacing: -0.5 },
  date: { fontSize: 13, color: t.muted, marginTop: 2, textTransform: "capitalize" },
  logoutBtn: { padding: 8, borderRadius: 10, borderWidth: 1.5, borderColor: t.border },
  logoutText: { fontSize: 13, color: t.muted, fontWeight: "600" },
  card: { backgroundColor: t.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: t.border },
  cardLabel: { fontSize: 10, fontWeight: "700", color: t.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 },
  bigCalorie: { fontSize: 40, fontWeight: "900", color: t.text, letterSpacing: -1 },
  kcalUnit: { fontSize: 16, fontWeight: "400", color: t.muted },
  calorieBar: { height: 6, backgroundColor: t.border, borderRadius: 99, marginVertical: 10, overflow: "hidden" },
  calorieBarFill: { height: 6, borderRadius: 99 },
  calorieGoalText: { fontSize: 12, color: t.muted, marginBottom: 16 },
  macrosRow: { flexDirection: "row", marginTop: 4 },
  quickAdd: { backgroundColor: t.salmon, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, alignItems: "center" },
  quickAddText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  entryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: 1, borderTopColor: t.border },
  entryName: { fontSize: 14, color: t.text, flex: 1, marginRight: 8 },
  entryKcal: { fontSize: 14, color: t.muted, fontWeight: "600" },
});
