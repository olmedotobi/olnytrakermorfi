import { useState, useCallback, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
  Animated, LayoutAnimation, UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useTheme } from "@/lib/theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Food = { name: string; calories: number; protein: number; carbs: number; fat: number; category: string };
type CustomFood = Food & { id: string };
type FoodEntry = { id: string; foodName: string; calories: number; protein: number; carbs: number; fat: number; mealType: string; grams: number };
type Tab = "buscar" | "mis" | "crear";

const CATEGORIES = ["Proteína", "Carbohidratos", "Verduras", "Frutas", "Lácteos", "Grasas", "Bebidas", "Comidas", "Snacks"];
const MEAL_TYPES = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Snack"] as const;
const MEAL_ICONS: Record<string, string> = { Desayuno: "☀️", Almuerzo: "🍽️", Cena: "🌙", Snack: "🍎", Merienda: "🫖" };
const CAT_ICONS: Record<string, string> = { Proteína: "🥩", Carbohidratos: "🌾", Verduras: "🥦", Frutas: "🍎", Lácteos: "🥛", Grasas: "🥑", Bebidas: "💧", Comidas: "🍳", Snacks: "🍿" };

function today() { return new Date().toISOString().slice(0, 10); }

function MacroRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const t = useTheme();
  const pct = Math.min(value / Math.max(max, 1), 1);
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 400, useNativeDriver: false }).start();
  }, [pct]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 11, color: t.muted, fontWeight: "600" }}>{label}</Text>
        <Text style={{ fontSize: 11, color, fontWeight: "700" }}>{value}g</Text>
      </View>
      <View style={{ height: 5, backgroundColor: t.border, borderRadius: 99, overflow: "hidden" }}>
        <Animated.View style={{ height: 5, backgroundColor: color, borderRadius: 99, width }} />
      </View>
    </View>
  );
}

function FoodDetail({
  food, grams, setGrams, mealType, setMealType, onAdd, adding, added, onClose,
}: {
  food: Food; grams: string; setGrams: (g: string) => void;
  mealType: string; setMealType: (m: string) => void;
  onAdd: () => void; adding: boolean; added: boolean; onClose: () => void;
}) {
  const t = useTheme();
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [food.name]);

  useEffect(() => {
    if (added) {
      Animated.sequence([
        Animated.spring(successScale, { toValue: 1.08, useNativeDriver: true, tension: 200 }),
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
  }, [added]);

  const g = parseFloat(grams) || 100;
  const r = g / 100;
  const maxMacro = Math.max(food.protein, food.carbs, food.fat, 1);
  const s = detailStyles(t);

  return (
    <Animated.View style={[s.wrap, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.cat}>{food.category.toUpperCase()}</Text>
          <Text style={s.name}>{food.name}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <Ionicons name="close" size={20} color={t.muted} />
        </TouchableOpacity>
      </View>

      {/* Macro grid */}
      <View style={s.macroGrid}>
        {[
          { label: "KCAL", value: Math.round(food.calories * r), color: t.salmon },
          { label: "PROT", value: Math.round(food.protein * r * 10) / 10, color: t.lavender },
          { label: "CARB", value: Math.round(food.carbs * r * 10) / 10, color: t.warning },
          { label: "GRAS", value: Math.round(food.fat * r * 10) / 10, color: t.muted },
        ].map(m => (
          <View key={m.label} style={[s.macroBox, { backgroundColor: t.input }]}>
            <Text style={[s.macroLabel, { color: m.color }]}>{m.label}</Text>
            <Text style={[s.macroVal, { color: t.text }]}>{m.value}</Text>
          </View>
        ))}
      </View>

      {/* Grams input */}
      <Text style={s.fieldLabel}>PORCIÓN (GRAMOS)</Text>
      <View style={[s.gramsRow, { borderColor: t.border, backgroundColor: t.input }]}>
        <TouchableOpacity onPress={() => setGrams(String(Math.max(10, g - 10)))} style={s.gramsBtn}>
          <Ionicons name="remove" size={18} color={t.text} />
        </TouchableOpacity>
        <TextInput
          style={[s.gramsInput, { color: t.text }]}
          value={grams}
          onChangeText={setGrams}
          keyboardType="numeric"
          selectTextOnFocus
        />
        <Text style={[s.gramsSuffix, { color: t.muted }]}>g</Text>
        <TouchableOpacity onPress={() => setGrams(String(g + 10))} style={s.gramsBtn}>
          <Ionicons name="add" size={18} color={t.text} />
        </TouchableOpacity>
      </View>

      {/* Quick gram buttons */}
      <View style={s.quickGrams}>
        {[50, 100, 150, 200, 250].map(qg => (
          <TouchableOpacity key={qg} onPress={() => setGrams(String(qg))}
            style={[s.quickGramBtn, { borderColor: t.border, backgroundColor: g === qg ? t.text : t.input }]}>
            <Text style={[s.quickGramText, { color: g === qg ? t.card : t.muted }]}>{qg}g</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Macro bars */}
      <Text style={[s.fieldLabel, { marginTop: 14 }]}>MACROS / 100G</Text>
      <MacroRow label="Proteína" value={food.protein} max={maxMacro} color={t.lavender} />
      <MacroRow label="Carbohidratos" value={food.carbs} max={maxMacro} color={t.warning} />
      <MacroRow label="Grasas" value={food.fat} max={maxMacro} color={t.salmon} />

      {/* Meal type */}
      <Text style={[s.fieldLabel, { marginTop: 14 }]}>COMIDA</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: "row", gap: 8, paddingRight: 8 }}>
          {MEAL_TYPES.map(m => (
            <TouchableOpacity key={m} onPress={() => setMealType(m)}
              style={[s.mealChip, { borderColor: mealType === m ? t.text : t.border, backgroundColor: mealType === m ? t.text : t.input }]}>
              <Text style={[s.mealChipText, { color: mealType === m ? t.card : t.text }]}>
                {MEAL_ICONS[m]} {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Add button */}
      <Animated.View style={{ transform: [{ scale: successScale }] }}>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: added ? t.mint : t.text }]}
          onPress={onAdd}
          disabled={adding || added}
        >
          {adding ? <ActivityIndicator color={t.card} size="small" /> : (
            <>
              <Ionicons name={added ? "checkmark-circle" : "add-circle"} size={20} color={t.card} />
              <Text style={[s.addBtnText, { color: t.card }]}>
                {added ? "¡Agregado!" : `Agregar ${g}g al diario`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const detailStyles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  wrap: { backgroundColor: t.card, borderRadius: 20, padding: 20, marginHorizontal: 16, marginTop: 12, borderWidth: 1.5, borderColor: t.border },
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16, gap: 10 },
  cat: { fontSize: 9, fontWeight: "700", letterSpacing: 1.4, color: t.muted, textTransform: "uppercase", marginBottom: 3 },
  name: { fontSize: 18, fontWeight: "800", color: t.text, letterSpacing: -0.3, lineHeight: 24 },
  closeBtn: { padding: 4, marginTop: 2 },
  macroGrid: { flexDirection: "row", gap: 8, marginBottom: 16 },
  macroBox: { flex: 1, borderRadius: 12, padding: 10, alignItems: "center" },
  macroLabel: { fontSize: 8, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  macroVal: { fontSize: 18, fontWeight: "900" },
  fieldLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1.4, color: t.muted, textTransform: "uppercase", marginBottom: 8 },
  gramsRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 14, marginBottom: 10, overflow: "hidden" },
  gramsBtn: { padding: 14 },
  gramsInput: { flex: 1, textAlign: "center", fontSize: 22, fontWeight: "800", paddingVertical: 12 },
  gramsSuffix: { fontSize: 14, paddingRight: 4 },
  quickGrams: { flexDirection: "row", gap: 8, marginBottom: 4 },
  quickGramBtn: { flex: 1, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, alignItems: "center" },
  quickGramText: { fontSize: 12, fontWeight: "600" },
  mealChip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5 },
  mealChipText: { fontSize: 13, fontWeight: "600" },
  addBtn: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  addBtnText: { fontWeight: "700", fontSize: 16 },
});

// ─── Main screen ───────────────────────────────────────────────────────────

export default function FoodsScreen() {
  const t = useTheme();
  const [tab, setTab] = useState<Tab>("buscar");
  const tabAnim = useRef(new Animated.Value(0)).current;

  // Search tab state
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [results, setResults] = useState<Food[]>([]);
  const [featured, setFeatured] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState("100");
  const [mealType, setMealType] = useState("Almuerzo");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Mis alimentos
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  // Crear
  const [recipeMode, setRecipeMode] = useState(false);
  const [newFood, setNewFood] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", category: "Personalizado" });
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeResults, setRecipeResults] = useState<Food[]>([]);
  const [ingredients, setIngredients] = useState<{ food: Food; grams: number }[]>([]);

  // Load featured on mount
  useEffect(() => {
    apiGet<Food[]>("/api/foods?featured=1").then(d => setFeatured(Array.isArray(d) ? d : []));
  }, []);

  const switchTab = (next: Tab) => {
    Animated.timing(tabAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
      setTab(next);
      Animated.timing(tabAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };
  useEffect(() => { tabAnim.setValue(1); }, []);

  const loadCustomFoods = useCallback(async () => {
    setLoadingCustom(true);
    const d = await apiGet<CustomFood[]>("/api/custom-foods");
    setCustomFoods(Array.isArray(d) ? d : []);
    setLoadingCustom(false);
  }, []);

  useEffect(() => { if (tab === "mis") loadCustomFoods(); }, [tab]);

  const search = async (q: string) => {
    setQuery(q);
    setSelectedCat(null);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const res = await apiGet<Food[]>(`/api/foods?q=${encodeURIComponent(q)}`);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setResults(Array.isArray(res) ? res : []);
    setSearching(false);
  };

  const browseCategory = async (cat: string) => {
    const next = selectedCat === cat ? null : cat;
    setSelectedCat(next);
    setQuery("");
    setResults([]);
    if (!next) return;
    setSearching(true);
    const res = await apiGet<Food[]>(`/api/foods?category=${encodeURIComponent(cat)}`);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setResults(Array.isArray(res) ? res : []);
    setSearching(false);
  };

  const selectFood = (food: Food) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedFood(food);
    setGrams("100");
    setAdded(false);
  };

  const addToLog = async () => {
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
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const recipeSearchFn = async (q: string) => {
    setRecipeSearch(q);
    if (q.length < 2) { setRecipeResults([]); return; }
    const res = await apiGet<Food[]>(`/api/foods?q=${encodeURIComponent(q)}`);
    setRecipeResults(Array.isArray(res) ? res.slice(0, 8) : []);
  };

  const recipeTotals = ingredients.reduce(
    (a, { food, grams: g }) => {
      const r = g / 100;
      return { cal: a.cal + food.calories * r, prot: a.prot + food.protein * r, carbs: a.carbs + food.carbs * r, fat: a.fat + food.fat * r };
    }, { cal: 0, prot: 0, carbs: 0, fat: 0 },
  );
  const recipeTotalGrams = ingredients.reduce((s, i) => s + i.grams, 0);

  const saveCustomFood = async () => {
    if (!newFood.name || !newFood.calories) { Alert.alert("Ingresá nombre y calorías"); return; }
    setSaveLoading(true);
    const saved = await apiPost<CustomFood>("/api/custom-foods", newFood);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCustomFoods(p => [saved, ...p]);
    setNewFood({ name: "", calories: "", protein: "", carbs: "", fat: "", category: "Personalizado" });
    setSaveLoading(false); setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
  };

  const saveRecipe = async () => {
    if (!recipeName || ingredients.length === 0) { Alert.alert("Ingresá nombre e ingredientes"); return; }
    setSaveLoading(true);
    const per100 = recipeTotalGrams > 0 ? 100 / recipeTotalGrams : 1;
    const saved = await apiPost<CustomFood>("/api/custom-foods", {
      name: recipeName,
      calories: Math.round(recipeTotals.cal * per100),
      protein: Math.round(recipeTotals.prot * per100 * 10) / 10,
      carbs: Math.round(recipeTotals.carbs * per100 * 10) / 10,
      fat: Math.round(recipeTotals.fat * per100 * 10) / 10,
      category: "Receta",
    });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCustomFoods(p => [saved, ...p]);
    setIngredients([]); setRecipeName(""); setRecipeSearch(""); setRecipeResults([]);
    setSaveLoading(false); setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
  };

  const deleteCustomFood = (id: string) => {
    Alert.alert("Eliminar", "¿Eliminar este alimento?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        await apiDelete(`/api/custom-foods?id=${id}`);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCustomFoods(p => p.filter(f => f.id !== id));
      }},
    ]);
  };

  const displayList = query.length >= 2 || selectedCat ? results : featured;

  const s = styles(t);
  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Tu <Text style={s.titleItalic}>despensa</Text> 🥦</Text>
          <Text style={s.subtitle}>{featured.length} alimentos · Buscá o navegá por categoría</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {(["buscar", "mis", "crear"] as Tab[]).map((id, i) => {
          const labels = ["Buscar", "Mis alimentos", "Crear"];
          const icons: Array<"search" | "star" | "add-circle"> = ["search", "star", "add-circle"];
          const active = tab === id;
          return (
            <TouchableOpacity key={id} onPress={() => switchTab(id)}
              style={[s.tabBtn, active && { backgroundColor: t.text }]}>
              <Ionicons name={icons[i]} size={14} color={active ? t.card : t.muted} />
              <Text style={[s.tabLabel, { color: active ? t.card : t.muted }]}>{labels[i]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Animated.View style={{ flex: 1, opacity: tabAnim }}>

        {/* ── TAB: BUSCAR ── */}
        {tab === "buscar" && (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Search */}
              <View style={s.searchWrap}>
                <Ionicons name="search" size={16} color={t.muted} style={{ marginRight: 8 }} />
                <TextInput
                  style={[s.searchInput, { color: t.text }]}
                  placeholder="Buscar alimento..."
                  placeholderTextColor={t.muted}
                  value={query}
                  onChangeText={search}
                  clearButtonMode="while-editing"
                />
                {searching && <ActivityIndicator color={t.salmon} size="small" />}
              </View>

              {/* Category chips */}
              {!query && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat} onPress={() => browseCategory(cat)}
                      style={[s.catChip, selectedCat === cat && { backgroundColor: t.text, borderColor: t.text }]}>
                      <Text style={s.catChipIcon}>{CAT_ICONS[cat] ?? "🍴"}</Text>
                      <Text style={[s.catChipText, { color: selectedCat === cat ? t.card : t.text }]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Section label */}
              <Text style={s.sectionLabel}>
                {query ? `Resultados para "${query}"` : selectedCat ? selectedCat : "Destacados"}
              </Text>

              {/* Food list */}
              {displayList.map(food => {
                const sel = selectedFood?.name === food.name;
                return (
                  <TouchableOpacity key={food.name} onPress={() => selectFood(food)}
                    style={[s.foodRow, sel && { backgroundColor: t.text, borderColor: t.text }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.foodName, { color: sel ? t.card : t.text }]} numberOfLines={1}>{food.name}</Text>
                      <Text style={[s.foodMeta, { color: sel ? "rgba(255,255,255,0.55)" : t.muted }]}>
                        P {food.protein}g · C {food.carbs}g · G {food.fat}g
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[s.foodCal, { color: sel ? t.card : t.text }]}>{food.calories}</Text>
                      <Text style={[s.foodCalUnit, { color: sel ? "rgba(255,255,255,0.5)" : t.muted }]}>kcal/100g</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Food detail */}
              {selectedFood && (
                <FoodDetail
                  food={selectedFood}
                  grams={grams} setGrams={setGrams}
                  mealType={mealType} setMealType={setMealType}
                  onAdd={addToLog} adding={adding} added={added}
                  onClose={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setSelectedFood(null); }}
                />
              )}

              <View style={{ height: 32 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {/* ── TAB: MIS ALIMENTOS ── */}
        {tab === "mis" && (
          <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
            {loadingCustom ? (
              <ActivityIndicator color={t.salmon} style={{ marginTop: 40 }} />
            ) : customFoods.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={{ fontSize: 44, marginBottom: 12 }}>🍳</Text>
                <Text style={[s.emptyTitle, { color: t.text }]}>Sin alimentos personalizados</Text>
                <Text style={[s.emptySub, { color: t.muted }]}>Creá tus propios alimentos o recetas en la pestaña Crear</Text>
                <TouchableOpacity style={[s.emptyBtn, { backgroundColor: t.text }]} onPress={() => switchTab("crear")}>
                  <Text style={[s.emptyBtnText, { color: t.card }]}>+ Crear primer alimento</Text>
                </TouchableOpacity>
              </View>
            ) : (
              customFoods.map(food => (
                <View key={food.id} style={s.customCard}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Text style={[s.customName, { color: t.text }]}>{food.name}</Text>
                      <View style={[s.badge, { backgroundColor: food.category === "Receta" ? t.mintBg : t.lavenderBg }]}>
                        <Text style={[s.badgeText, { color: food.category === "Receta" ? t.mint : t.lavender }]}>
                          {food.category}
                        </Text>
                      </View>
                    </View>
                    <Text style={[s.customMeta, { color: t.muted }]}>
                      {food.calories} kcal · P {food.protein}g · C {food.carbs}g · G {food.fat}g
                    </Text>
                    <Text style={[s.customPer, { color: t.muted }]}>por 100g</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => { switchTab("buscar"); setSelectedFood(food); setGrams("100"); setAdded(false); }}
                      style={[s.useBtn, { borderColor: t.border, backgroundColor: t.input }]}>
                      <Text style={[s.useBtnText, { color: t.text }]}>Usar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteCustomFood(food.id)} style={[s.delBtn, { borderColor: t.border }]}>
                      <Ionicons name="trash-outline" size={15} color={t.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* ── TAB: CREAR ── */}
        {tab === "crear" && (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={s.tabContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

              {/* Mode toggle */}
              <View style={s.modeToggle}>
                <TouchableOpacity onPress={() => setRecipeMode(false)}
                  style={[s.modeBtn, !recipeMode && { backgroundColor: t.text }]}>
                  <Ionicons name="nutrition-outline" size={14} color={!recipeMode ? t.card : t.muted} />
                  <Text style={[s.modeBtnText, { color: !recipeMode ? t.card : t.muted }]}>Alimento simple</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRecipeMode(true)}
                  style={[s.modeBtn, recipeMode && { backgroundColor: t.text }]}>
                  <Ionicons name="restaurant-outline" size={14} color={recipeMode ? t.card : t.muted} />
                  <Text style={[s.modeBtnText, { color: recipeMode ? t.card : t.muted }]}>Receta / Mezcla</Text>
                </TouchableOpacity>
              </View>

              {!recipeMode ? (
                /* Simple food form */
                <View style={s.formCard}>
                  <Text style={s.cardLabel}>NUEVO ALIMENTO PERSONALIZADO</Text>
                  <Text style={s.fieldLabel}>NOMBRE</Text>
                  <View style={[s.inputWrap, { borderColor: t.border, backgroundColor: t.input }]}>
                    <TextInput style={[s.input, { color: t.text }]} placeholder="Ej: Batido casero de banana"
                      placeholderTextColor={t.muted} value={newFood.name}
                      onChangeText={v => setNewFood(p => ({ ...p, name: v }))} />
                  </View>

                  <View style={s.macroFormGrid}>
                    {[
                      { key: "calories", label: "CALORÍAS (kcal)" },
                      { key: "protein",  label: "PROTEÍNA (g)" },
                      { key: "carbs",    label: "CARBOS (g)" },
                      { key: "fat",      label: "GRASAS (g)" },
                    ].map(f => (
                      <View key={f.key} style={{ width: "48%" }}>
                        <Text style={s.fieldLabel}>{f.label}</Text>
                        <View style={[s.inputWrap, { borderColor: t.border, backgroundColor: t.input }]}>
                          <TextInput style={[s.input, { color: t.text }]} placeholder="0"
                            placeholderTextColor={t.muted} keyboardType="numeric"
                            value={newFood[f.key as keyof typeof newFood]}
                            onChangeText={v => setNewFood(p => ({ ...p, [f.key]: v }))} />
                        </View>
                      </View>
                    ))}
                  </View>

                  <Text style={s.fieldLabel}>CATEGORÍA</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {["Personalizado", ...CATEGORIES].map(cat => (
                        <TouchableOpacity key={cat} onPress={() => setNewFood(p => ({ ...p, category: cat }))}
                          style={[s.catChip, newFood.category === cat && { backgroundColor: t.text, borderColor: t.text }]}>
                          <Text style={[s.catChipText, { color: newFood.category === cat ? t.card : t.text }]}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <Text style={[s.hint, { color: t.muted }]}>Todos los valores son por cada 100g del alimento.</Text>

                  <TouchableOpacity
                    style={[s.saveBtn, { backgroundColor: savedOk ? t.mint : t.text }]}
                    onPress={saveCustomFood} disabled={saveLoading || savedOk}>
                    {saveLoading ? <ActivityIndicator color={t.card} size="small" /> : (
                      <>
                        <Ionicons name={savedOk ? "checkmark-circle" : "save-outline"} size={18} color={t.card} />
                        <Text style={[s.saveBtnText, { color: t.card }]}>
                          {savedOk ? "¡Guardado en Mis alimentos!" : "Guardar alimento"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                /* Recipe mode */
                <View style={{ gap: 12 }}>
                  <View style={s.formCard}>
                    <Text style={s.cardLabel}>NOMBRE DE LA RECETA</Text>
                    <View style={[s.inputWrap, { borderColor: t.border, backgroundColor: t.input }]}>
                      <TextInput style={[s.input, { color: t.text }]}
                        placeholder="Ej: Bowl de proteína post-entreno"
                        placeholderTextColor={t.muted} value={recipeName}
                        onChangeText={setRecipeName} />
                    </View>
                  </View>

                  <View style={s.formCard}>
                    <Text style={s.cardLabel}>INGREDIENTES</Text>
                    <View style={[s.searchWrap, { marginHorizontal: 0, marginBottom: 10 }]}>
                      <Ionicons name="search" size={14} color={t.muted} style={{ marginRight: 6 }} />
                      <TextInput style={[s.searchInput, { color: t.text }]}
                        placeholder="Buscar ingrediente..."
                        placeholderTextColor={t.muted} value={recipeSearch}
                        onChangeText={recipeSearchFn} />
                    </View>

                    {recipeResults.length > 0 && (
                      <View style={[s.resultsBox, { marginBottom: 12 }]}>
                        {recipeResults.map(f => (
                          <TouchableOpacity key={f.name} style={s.resultItem}
                            onPress={() => { setIngredients(p => [...p, { food: f, grams: 100 }]); setRecipeSearch(""); setRecipeResults([]); }}>
                            <Text style={[s.resultName, { color: t.text }]} numberOfLines={1}>{f.name}</Text>
                            <Text style={[s.resultCal, { color: t.muted }]}>{f.calories} kcal</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {ingredients.map((ing, idx) => (
                      <View key={idx} style={[s.ingRow, { backgroundColor: t.input, borderColor: t.border }]}>
                        <Text style={[s.ingName, { color: t.text }]} numberOfLines={1}>{ing.food.name}</Text>
                        <View style={[s.ingGramsWrap, { borderColor: t.border, backgroundColor: t.card }]}>
                          <TextInput
                            style={[s.ingGrams, { color: t.text }]}
                            value={String(ing.grams)}
                            onChangeText={v => setIngredients(p => p.map((i, j) => j === idx ? { ...i, grams: parseFloat(v) || 0 } : i))}
                            keyboardType="numeric" selectTextOnFocus
                          />
                        </View>
                        <Text style={[s.ingUnit, { color: t.muted }]}>g</Text>
                        <TouchableOpacity onPress={() => setIngredients(p => p.filter((_, j) => j !== idx))} style={{ padding: 6 }}>
                          <Ionicons name="close" size={16} color={t.muted} />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {ingredients.length === 0 && (
                      <Text style={[s.emptyText, { color: t.muted }]}>Buscá ingredientes arriba para agregar</Text>
                    )}
                  </View>

                  {ingredients.length > 0 && (
                    <View style={[s.formCard, { backgroundColor: t.mintBg, borderColor: t.mint }]}>
                      <Text style={[s.cardLabel, { color: t.mint }]}>
                        TOTALES DE LA RECETA ({recipeTotalGrams}g)
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {[
                          { label: "KCAL", value: Math.round(recipeTotals.cal), color: t.salmon },
                          { label: "PROT", value: Math.round(recipeTotals.prot * 10) / 10, color: t.lavender },
                          { label: "CARB", value: Math.round(recipeTotals.carbs * 10) / 10, color: t.warning },
                          { label: "GRAS", value: Math.round(recipeTotals.fat * 10) / 10, color: t.muted },
                        ].map(m => (
                          <View key={m.label} style={[s.macroBox, { backgroundColor: t.card }]}>
                            <Text style={[s.macroLabel, { color: m.color }]}>{m.label}</Text>
                            <Text style={[s.macroVal, { color: t.text }]}>{m.value}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={[s.hint, { color: t.mint, marginTop: 10 }]}>
                        Se guarda a 100g → {recipeTotalGrams > 0 ? Math.round(recipeTotals.cal * 100 / recipeTotalGrams) : 0} kcal/100g
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[s.saveBtn, { backgroundColor: savedOk ? t.mint : t.text }]}
                    onPress={saveRecipe} disabled={saveLoading || savedOk}>
                    {saveLoading ? <ActivityIndicator color={t.card} size="small" /> : (
                      <>
                        <Ionicons name={savedOk ? "checkmark-circle" : "restaurant-outline"} size={18} color={t.card} />
                        <Text style={[s.saveBtnText, { color: t.card }]}>
                          {savedOk ? "¡Receta guardada!" : "Guardar receta"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 24 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "900", color: t.text, letterSpacing: -0.5 },
  titleItalic: { fontStyle: "italic", fontWeight: "400" },
  subtitle: { fontSize: 12, color: t.muted, marginTop: 2 },
  tabBar: { flexDirection: "row", marginHorizontal: 16, marginBottom: 12, backgroundColor: t.input, borderRadius: 14, padding: 4, gap: 4 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 11 },
  tabLabel: { fontSize: 12, fontWeight: "700" },
  searchWrap: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 10, backgroundColor: t.input, borderWidth: 1.5, borderColor: t.border, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  catScroll: { paddingLeft: 16, marginBottom: 10 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: t.border, backgroundColor: t.card },
  catChipIcon: { fontSize: 14 },
  catChipText: { fontSize: 13, fontWeight: "600" },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: t.muted, textTransform: "uppercase", marginHorizontal: 16, marginBottom: 8 },
  foodRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 6, backgroundColor: t.card, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: t.border },
  foodName: { fontSize: 14, fontWeight: "600" },
  foodMeta: { fontSize: 11, marginTop: 2 },
  foodCal: { fontSize: 18, fontWeight: "900" },
  foodCalUnit: { fontSize: 10 },
  tabContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  emptySub: { fontSize: 14, textAlign: "center", marginBottom: 20, lineHeight: 20 },
  emptyBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14 },
  emptyBtnText: { fontWeight: "700", fontSize: 15 },
  emptyText: { textAlign: "center", fontSize: 13, paddingVertical: 16 },
  customCard: { flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: t.border, gap: 10 },
  customName: { fontSize: 15, fontWeight: "700" },
  customMeta: { fontSize: 12, marginTop: 2 },
  customPer: { fontSize: 10, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  useBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5 },
  useBtnText: { fontSize: 13, fontWeight: "600" },
  delBtn: { padding: 8, borderRadius: 10, borderWidth: 1.5 },
  modeToggle: { flexDirection: "row", backgroundColor: t.input, borderRadius: 14, padding: 4, gap: 4, marginBottom: 12 },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 11 },
  modeBtnText: { fontSize: 13, fontWeight: "700" },
  formCard: { backgroundColor: t.card, borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: t.border, marginBottom: 12 },
  cardLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1.4, color: t.muted, textTransform: "uppercase", marginBottom: 12 },
  fieldLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1.2, color: t.muted, textTransform: "uppercase", marginBottom: 7 },
  inputWrap: { borderWidth: 1.5, borderRadius: 12, marginBottom: 12 },
  input: { padding: 12, fontSize: 15 },
  macroFormGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  macroBox: { flex: 1, borderRadius: 12, padding: 10, alignItems: "center" },
  macroLabel: { fontSize: 8, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  macroVal: { fontSize: 16, fontWeight: "900" },
  hint: { fontSize: 12, marginBottom: 14 },
  saveBtn: { borderRadius: 16, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveBtnText: { fontWeight: "700", fontSize: 15 },
  resultsBox: { backgroundColor: t.input, borderRadius: 12, borderWidth: 1.5, borderColor: t.border, overflow: "hidden" },
  resultItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderBottomWidth: 1, borderBottomColor: t.border },
  resultName: { fontSize: 14, fontWeight: "600", flex: 1 },
  resultCal: { fontSize: 12, marginLeft: 8 },
  ingRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 10, marginBottom: 8, gap: 8, borderWidth: 1, },
  ingName: { flex: 1, fontSize: 13, fontWeight: "600" },
  ingGramsWrap: { borderWidth: 1.5, borderRadius: 8, width: 60 },
  ingGrams: { padding: 6, fontSize: 14, textAlign: "center", fontWeight: "700" },
  ingUnit: { fontSize: 12 },
});
