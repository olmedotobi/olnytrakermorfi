import { useState, useCallback, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, Modal, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useTheme } from "@/lib/theme";

type Food = { name: string; calories: number; protein: number; carbs: number; fat: number; category: string };
type FoodEntry = { id: string; foodName: string; calories: number; protein: number; carbs: number; fat: number; mealType: string; grams: number };

const MEAL_TYPES = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Snack"] as const;
const MEAL_ICONS: Record<string, string> = {
  Desayuno: "☀️", Almuerzo: "🍽️", Cena: "🌙", Snack: "🍎", Merienda: "🫖",
};

function today() { return new Date().toISOString().slice(0, 10); }

export default function FoodsScreen() {
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState("100");
  const [mealType, setMealType] = useState<string>("Almuerzo");
  const [adding, setAdding] = useState(false);

  const loadEntries = useCallback(async () => {
    const e = await apiGet<FoodEntry[]>(`/api/food-entries?date=${today()}`);
    setEntries(Array.isArray(e) ? e : []);
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const res = await apiGet<Food[]>(`/api/foods?q=${encodeURIComponent(q)}`);
    setResults(Array.isArray(res) ? res : []);
    setSearching(false);
  };

  const confirmAdd = async () => {
    if (!selectedFood) return;
    const g = parseFloat(grams) || 100;
    const r = g / 100;
    setAdding(true);
    await apiPost("/api/food-entries", {
      date: today(), foodName: selectedFood.name, grams: g,
      calories: Math.round(selectedFood.calories * r),
      protein: Math.round(selectedFood.protein * r * 10) / 10,
      carbs: Math.round(selectedFood.carbs * r * 10) / 10,
      fat: Math.round(selectedFood.fat * r * 10) / 10,
      mealType,
    });
    setAdding(false);
    setSelectedFood(null);
    setQuery("");
    setResults([]);
    loadEntries();
  };

  const deleteEntry = (id: string) => {
    Alert.alert("Eliminar", "¿Eliminar este registro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        await apiDelete(`/api/food-entries?id=${id}`);
        loadEntries();
      }},
    ]);
  };

  const totals = entries.reduce(
    (a, e) => ({ cal: a.cal + e.calories, prot: a.prot + e.protein, carbs: a.carbs + e.carbs, fat: a.fat + e.fat }),
    { cal: 0, prot: 0, carbs: 0, fat: 0 },
  );

  const byMeal = entries.reduce((acc, e) => {
    (acc[e.mealType] ??= []).push(e);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  const macroForFood = (food: Food, g: number) => {
    const r = g / 100;
    return {
      cal: Math.round(food.calories * r),
      prot: Math.round(food.protein * r * 10) / 10,
      carbs: Math.round(food.carbs * r * 10) / 10,
      fat: Math.round(food.fat * r * 10) / 10,
    };
  };

  const s = styles(t);
  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Alimentos</Text>
        {entries.length > 0 && (
          <Text style={s.headerSub}>
            {Math.round(totals.cal)} kcal · {Math.round(totals.prot)}p {Math.round(totals.carbs)}c {Math.round(totals.fat)}g
          </Text>
        )}
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={16} color={t.muted} style={{ marginRight: 8 }} />
        <TextInput
          style={[s.searchInput, { color: t.text }]}
          placeholder="Buscar alimento..."
          placeholderTextColor={t.muted}
          value={query}
          onChangeText={search}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searching && <ActivityIndicator color={t.salmon} size="small" />}
      </View>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <View style={s.resultsBox}>
          <FlatList
            data={results}
            keyExtractor={i => i.name}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.resultItem}
                onPress={() => { setSelectedFood(item); setResults([]); setQuery(""); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.resultName} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.resultMeta}>{item.calories} kcal/100g · {item.category}</Text>
                </View>
                <Ionicons name="add-circle" size={22} color={t.salmon} />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Food log */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {MEAL_TYPES.filter(m => byMeal[m]?.length).map(meal => (
          <View key={meal} style={s.mealSection}>
            <View style={s.mealHeader}>
              <Text style={s.mealIcon}>{MEAL_ICONS[meal]}</Text>
              <Text style={s.mealTitle}>{meal}</Text>
              <Text style={[s.mealKcal, { color: t.muted }]}>
                {Math.round(byMeal[meal].reduce((a, e) => a + e.calories, 0))} kcal
              </Text>
            </View>
            {byMeal[meal].map(e => (
              <View key={e.id} style={s.entryCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.entryName} numberOfLines={1}>{e.foodName}</Text>
                  <Text style={s.entryMeta}>{e.grams}g · {Math.round(e.protein)}p {Math.round(e.carbs)}c {Math.round(e.fat)}g</Text>
                </View>
                <Text style={s.entryKcal}>{Math.round(e.calories)}</Text>
                <Text style={[s.entryKcalUnit, { color: t.muted }]}>kcal</Text>
                <TouchableOpacity onPress={() => deleteEntry(e.id)} style={s.deleteBtn}>
                  <Ionicons name="trash-outline" size={15} color={t.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        {entries.length === 0 && !query && (
          <View style={s.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🥗</Text>
            <Text style={[s.emptyTitle, { color: t.text }]}>Sin registros hoy</Text>
            <Text style={[s.emptySub, { color: t.muted }]}>Buscá un alimento arriba para agregar</Text>
          </View>
        )}
      </ScrollView>

      {/* Add food modal */}
      <Modal visible={!!selectedFood} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: t.bg }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={s.modal} keyboardShouldPersistTaps="handled">
            <View style={s.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.modalTitle} numberOfLines={2}>{selectedFood?.name}</Text>
                <Text style={[s.modalMeta, { color: t.muted }]}>
                  {selectedFood?.calories} kcal / 100g · {selectedFood?.category}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFood(null)} style={s.closeBtn}>
                <Ionicons name="close" size={22} color={t.muted} />
              </TouchableOpacity>
            </View>

            {/* Macro preview */}
            {selectedFood && (
              <View style={s.macroPreview}>
                {[
                  { label: "KCAL", value: macroForFood(selectedFood, parseFloat(grams) || 100).cal, color: t.salmon },
                  { label: "PROT", value: macroForFood(selectedFood, parseFloat(grams) || 100).prot, color: t.lavender },
                  { label: "CARB", value: macroForFood(selectedFood, parseFloat(grams) || 100).carbs, color: t.warning },
                  { label: "GRAS", value: macroForFood(selectedFood, parseFloat(grams) || 100).fat, color: t.muted },
                ].map(m => (
                  <View key={m.label} style={[s.macroBox, { backgroundColor: t.input }]}>
                    <Text style={[s.macroLabel, { color: m.color }]}>{m.label}</Text>
                    <Text style={[s.macroVal, { color: t.text }]}>{m.value}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={s.fieldLabel}>GRAMOS</Text>
            <View style={[s.inputWrap, { borderColor: t.border, backgroundColor: t.input }]}>
              <TextInput
                style={[s.input, { color: t.text }]}
                value={grams}
                onChangeText={setGrams}
                keyboardType="numeric"
                selectTextOnFocus
              />
            </View>

            <Text style={[s.fieldLabel, { marginTop: 16 }]}>COMIDA</Text>
            <View style={s.mealRow}>
              {MEAL_TYPES.map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMealType(m)}
                  style={[s.mealChip, mealType === m && { backgroundColor: t.text, borderColor: t.text }]}
                >
                  <Text style={[s.mealChipText, { color: mealType === m ? t.card : t.text }]}>
                    {MEAL_ICONS[m]} {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[s.addBtn, { backgroundColor: t.text, marginTop: 24 }]} onPress={confirmAdd} disabled={adding}>
              {adding ? <ActivityIndicator color={t.card} /> : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color={t.card} />
                  <Text style={[s.addBtnText, { color: t.card }]}>Agregar</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: "900", color: t.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: t.muted, marginTop: 2 },
  searchWrap: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 8, backgroundColor: t.input, borderWidth: 1.5, borderColor: t.border, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  resultsBox: { backgroundColor: t.card, marginHorizontal: 16, borderRadius: 14, borderWidth: 1.5, borderColor: t.border, maxHeight: 260, marginBottom: 8 },
  resultItem: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: t.border, gap: 8 },
  resultName: { fontSize: 15, fontWeight: "600", color: t.text },
  resultMeta: { fontSize: 12, color: t.muted, marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  mealSection: { marginBottom: 16 },
  mealHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  mealIcon: { fontSize: 16 },
  mealTitle: { fontSize: 14, fontWeight: "700", color: t.text, flex: 1 },
  mealKcal: { fontSize: 12, fontWeight: "600" },
  entryCard: { flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1.5, borderColor: t.border, gap: 6 },
  entryName: { fontSize: 14, fontWeight: "600", color: t.text },
  entryMeta: { fontSize: 11, color: t.muted, marginTop: 1 },
  entryKcal: { fontSize: 16, fontWeight: "800", color: t.text },
  entryKcalUnit: { fontSize: 10, marginLeft: -4 },
  deleteBtn: { padding: 4 },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  emptySub: { fontSize: 14 },
  modal: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: t.text, letterSpacing: -0.3, lineHeight: 26 },
  modalMeta: { fontSize: 13, marginTop: 4 },
  closeBtn: { padding: 4 },
  macroPreview: { flexDirection: "row", gap: 8, marginBottom: 20 },
  macroBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  macroLabel: { fontSize: 8, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  macroVal: { fontSize: 18, fontWeight: "900" },
  fieldLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1.2, color: t.muted, textTransform: "uppercase", marginBottom: 8 },
  inputWrap: { borderWidth: 1.5, borderRadius: 14 },
  input: { padding: 14, fontSize: 22, fontWeight: "700", textAlign: "center" },
  mealRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  mealChip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: t.border },
  mealChipText: { fontSize: 13, fontWeight: "600" },
  addBtn: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  addBtnText: { fontWeight: "700", fontSize: 16 },
});
