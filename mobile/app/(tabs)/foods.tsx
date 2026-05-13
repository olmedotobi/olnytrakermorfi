import { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useTheme } from "@/lib/theme";

type Food = { name: string; calories: number; protein: number; carbs: number; fat: number; category: string };
type FoodEntry = { id: string; foodName: string; calories: number; protein: number; carbs: number; fat: number; mealType: string; grams: number };

function today() { return new Date().toISOString().slice(0, 10); }

const MEAL_TYPES = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Snack"];

export default function FoodsScreen() {
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState("100");
  const [mealType, setMealType] = useState("Almuerzo");
  const [adding, setAdding] = useState(false);

  const loadEntries = useCallback(async () => {
    const e = await apiGet<FoodEntry[]>(`/api/food-entries?date=${today()}`);
    setEntries(Array.isArray(e) ? e : []);
    setLoaded(true);
  }, []);

  useState(() => { loadEntries(); });

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
    const ratio = g / 100;
    setAdding(true);
    await apiPost("/api/food-entries", {
      date: today(), foodName: selectedFood.name, grams: g,
      calories: selectedFood.calories * ratio,
      protein: selectedFood.protein * ratio,
      carbs: selectedFood.carbs * ratio,
      fat: selectedFood.fat * ratio,
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

  const s = styles(t);
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}><Text style={s.title}>Alimentos</Text></View>

      <View style={s.searchRow}>
        <TextInput style={s.searchInput} placeholder="Buscar alimento..." placeholderTextColor={t.muted}
          value={query} onChangeText={search} returnKeyType="search" />
        {searching && <ActivityIndicator color={t.salmon} style={{ marginLeft: 8 }} />}
      </View>

      {results.length > 0 && (
        <View style={s.resultsBox}>
          <FlatList data={results} keyExtractor={i => i.name}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.resultItem} onPress={() => { setSelectedFood(item); setResults([]); setQuery(""); }}>
                <Text style={s.resultName}>{item.name}</Text>
                <Text style={s.resultMeta}>{item.calories} kcal · {item.category}</Text>
              </TouchableOpacity>
            )} />
        </View>
      )}

      {loaded && (
        <FlatList data={entries} keyExtractor={i => i.id} contentContainerStyle={s.listContent}
          ListHeaderComponent={entries.length > 0 ? <Text style={s.sectionLabel}>HOY</Text> : null}
          ListEmptyComponent={<Text style={s.empty}>Sin registros hoy. Buscá un alimento para agregar.</Text>}
          renderItem={({ item }) => (
            <View style={s.entryCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.entryName} numberOfLines={1}>{item.foodName}</Text>
                <Text style={s.entryMeta}>{item.grams}g · {item.mealType}</Text>
              </View>
              <Text style={s.entryKcal}>{Math.round(item.calories)} kcal</Text>
              <TouchableOpacity onPress={() => deleteEntry(item.id)} style={s.deleteBtn}>
                <Text style={{ color: t.danger, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          )} />
      )}

      {/* Add food modal */}
      <Modal visible={!!selectedFood} animationType="slide" presentationStyle="pageSheet">
        <View style={[s.modal, { backgroundColor: t.bg }]}>
          <Text style={[s.title, { marginBottom: 4 }]}>{selectedFood?.name}</Text>
          <Text style={[s.resultMeta, { marginBottom: 20 }]}>{selectedFood?.calories} kcal / 100g</Text>

          <Text style={s.label}>GRAMOS</Text>
          <TextInput style={s.input} value={grams} onChangeText={setGrams} keyboardType="numeric" />

          <Text style={[s.label, { marginTop: 16 }]}>COMIDA</Text>
          <View style={s.mealRow}>
            {MEAL_TYPES.map(m => (
              <TouchableOpacity key={m} onPress={() => setMealType(m)}
                style={[s.mealBtn, mealType === m && { backgroundColor: t.text, borderColor: t.text }]}>
                <Text style={[s.mealBtnText, mealType === m && { color: t.card }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 24 }}>
            <TouchableOpacity style={s.btn} onPress={confirmAdd} disabled={adding}>
              {adding ? <ActivityIndicator color={t.card} /> : <Text style={s.btnText}>Agregar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setSelectedFood(null)}>
              <Text style={[s.btnText, { color: t.muted }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: t.text, letterSpacing: -0.5 },
  searchRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 8 },
  searchInput: { flex: 1, backgroundColor: t.input, borderWidth: 1.5, borderColor: t.border, borderRadius: 14, padding: 12, fontSize: 16, color: t.text },
  resultsBox: { backgroundColor: t.card, marginHorizontal: 16, borderRadius: 14, borderWidth: 1.5, borderColor: t.border, maxHeight: 240, marginBottom: 8 },
  resultItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: t.border },
  resultName: { fontSize: 15, fontWeight: "600", color: t.text },
  resultMeta: { fontSize: 12, color: t.muted, marginTop: 2 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: t.muted, textTransform: "uppercase", marginBottom: 8, marginHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { textAlign: "center", color: t.muted, marginTop: 40, fontSize: 14 },
  entryCard: { flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: t.border },
  entryName: { fontSize: 14, fontWeight: "600", color: t.text, flex: 1 },
  entryMeta: { fontSize: 12, color: t.muted },
  entryKcal: { fontSize: 14, color: t.muted, fontWeight: "600", marginRight: 8 },
  deleteBtn: { padding: 4 },
  modal: { flex: 1, padding: 24 },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: t.muted, textTransform: "uppercase", marginBottom: 6 },
  input: { backgroundColor: t.input, borderWidth: 1.5, borderColor: t.border, borderRadius: 14, padding: 12, fontSize: 16, color: t.text },
  mealRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  mealBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: t.border },
  mealBtnText: { fontSize: 13, fontWeight: "600", color: t.text },
  btn: { backgroundColor: t.text, borderRadius: 14, padding: 14, alignItems: "center", marginBottom: 10 },
  cancelBtn: { borderRadius: 14, padding: 14, alignItems: "center" },
  btnText: { color: t.card, fontWeight: "700", fontSize: 16 },
});
