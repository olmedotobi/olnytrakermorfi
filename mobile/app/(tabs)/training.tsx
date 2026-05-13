import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Accelerometer } from "expo-sensors";
import { apiGet, apiPost } from "@/lib/api";
import { useTheme } from "@/lib/theme";

type ExSet = { reps: number; weight: number };
type Exercise = { id: string; name: string; sets: ExSet[] };

function today() { return new Date().toISOString().slice(0, 10); }
function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
function addDays(d: string, n: number) {
  const dt = new Date(d + "T12:00:00");
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function TrainingScreen() {
  const t = useTheme();
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [steps, setSteps] = useState(0);
  const [savedSteps, setSavedSteps] = useState(0);
  const [counting, setCounting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [addingEx, setAddingEx] = useState(false);

  const lastMagRef = useRef<number | null>(null);
  const stepDeltaRef = useRef(0);

  const loadData = useCallback(async (d: string) => {
    setNotes(""); setExercises([]); setSteps(0); setSavedSteps(0); setSaved(false);
    const [session, stepsData] = await Promise.all([
      apiGet<{ notes: string; exercises: string | Exercise[] } | null>(`/api/workout-sessions?date=${d}`),
      apiGet<{ steps: number } | null>(`/api/steps?date=${d}`),
    ]);
    if (session) {
      setNotes(session.notes ?? "");
      const exs = Array.isArray(session.exercises)
        ? session.exercises
        : JSON.parse(typeof session.exercises === "string" ? session.exercises : "[]");
      setExercises(exs);
    }
    if (stepsData?.steps) { setSavedSteps(stepsData.steps); setSteps(stepsData.steps); }
  }, []);

  useEffect(() => { loadData(date); }, [date, loadData]);

  // Step counter via Accelerometer
  useEffect(() => {
    if (!counting) return;
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      if (lastMagRef.current !== null) {
        const delta = Math.abs(mag - lastMagRef.current);
        if (delta > 0.25) {
          stepDeltaRef.current += 1;
          setSteps(savedSteps + stepDeltaRef.current);
        }
      }
      lastMagRef.current = mag;
    });
    return () => { sub.remove(); lastMagRef.current = null; };
  }, [counting, savedSteps]);

  const toggleCounting = async () => {
    if (counting) {
      setCounting(false);
      const total = savedSteps + stepDeltaRef.current;
      stepDeltaRef.current = 0;
      setSavedSteps(total);
      setSteps(total);
      await apiPost("/api/steps", { date, steps: total });
    } else {
      stepDeltaRef.current = 0;
      lastMagRef.current = null;
      setCounting(true);
    }
  };

  const resetSteps = async () => {
    setSavedSteps(0); setSteps(0);
    await apiPost("/api/steps", { date, steps: 0 });
  };

  const saveWorkout = async () => {
    setSaving(true);
    await apiPost("/api/workout-sessions", { date, notes, exercises });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addExercise = () => {
    const name = newExName.trim();
    if (!name) return;
    setExercises(prev => [...prev, { id: uid(), name, sets: [{ reps: 10, weight: 0 }] }]);
    setNewExName(""); setAddingEx(false);
  };

  const removeExercise = (id: string) => setExercises(prev => prev.filter(e => e.id !== id));
  const updateExName = (id: string, name: string) =>
    setExercises(prev => prev.map(e => e.id === id ? { ...e, name } : e));
  const addSet = (id: string) =>
    setExercises(prev => prev.map(e => {
      if (e.id !== id) return e;
      const last = e.sets[e.sets.length - 1] ?? { reps: 10, weight: 0 };
      return { ...e, sets: [...e.sets, { ...last }] };
    }));
  const removeSet = (id: string, si: number) =>
    setExercises(prev => prev.map(e =>
      e.id === id ? { ...e, sets: e.sets.filter((_, i) => i !== si) } : e));
  const updateSet = (id: string, si: number, field: keyof ExSet, val: string) => {
    const num = parseFloat(val) || 0;
    setExercises(prev => prev.map(e =>
      e.id === id ? { ...e, sets: e.sets.map((s, i) => i === si ? { ...s, [field]: num } : s) } : e));
  };

  const isToday = date === today();
  const s = styles(t);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Entrenamiento</Text>
          <View style={s.dateNav}>
            <TouchableOpacity onPress={() => setDate(d => addDays(d, -1))} style={s.navBtn}>
              <Ionicons name="chevron-back" size={18} color={t.text} />
            </TouchableOpacity>
            <Text style={s.dateLabel}>{isToday ? "Hoy" : fmtDate(date)}</Text>
            <TouchableOpacity onPress={() => setDate(d => addDays(d, 1))} style={[s.navBtn, isToday && { opacity: 0.3 }]} disabled={isToday}>
              <Ionicons name="chevron-forward" size={18} color={t.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Step counter */}
        <View style={s.card}>
          <View style={s.cardRow}>
            <View style={s.cardRowLeft}>
              <Ionicons name="footsteps-outline" size={18} color={t.mint} />
              <Text style={s.cardRowTitle}>Pasos</Text>
            </View>
            <Text style={[s.stepsNum, { color: t.mint }]}>{steps.toLocaleString()}</Text>
          </View>
          <View style={s.stepBtns}>
            <TouchableOpacity
              style={[s.stepBtn, { backgroundColor: counting ? t.danger : t.mint }]}
              onPress={toggleCounting}
            >
              <Ionicons name={counting ? "stop" : "play"} size={16} color="#fff" />
              <Text style={s.stepBtnText}>{counting ? "Detener" : "Iniciar conteo"}</Text>
            </TouchableOpacity>
            {steps > 0 && !counting && (
              <TouchableOpacity style={s.resetBtn} onPress={resetSteps}>
                <Text style={[s.resetBtnText, { color: t.muted }]}>Resetear</Text>
              </TouchableOpacity>
            )}
          </View>
          {counting && (
            <Text style={[s.hint, { color: t.muted }]}>Llevá el celular en el bolsillo o la mano</Text>
          )}
        </View>

        {/* Notes */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Notas del entrenamiento</Text>
          <TextInput
            style={[s.notesInput, { color: t.text, borderColor: t.border, backgroundColor: t.input }]}
            placeholder="Ej: día de piernas, me sentí con energía..."
            placeholderTextColor={t.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Exercises */}
        <View style={s.card}>
          <View style={s.exerciseHeader}>
            <Text style={s.sectionTitle}>Ejercicios</Text>
            <TouchableOpacity style={s.addExBtn} onPress={() => setAddingEx(true)}>
              <Ionicons name="add" size={15} color={t.text} />
              <Text style={[s.addExBtnText, { color: t.text }]}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {addingEx && (
            <View style={s.addExRow}>
              <TextInput
                style={[s.addExInput, { color: t.text, borderColor: t.border, backgroundColor: t.input }]}
                placeholder="Nombre del ejercicio"
                placeholderTextColor={t.muted}
                value={newExName}
                onChangeText={setNewExName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={addExercise}
              />
              <TouchableOpacity style={[s.iconBtn, { backgroundColor: t.text }]} onPress={addExercise}>
                <Ionicons name="checkmark" size={16} color={t.card} />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} onPress={() => { setAddingEx(false); setNewExName(""); }}>
                <Ionicons name="close" size={16} color={t.muted} />
              </TouchableOpacity>
            </View>
          )}

          {exercises.length === 0 && !addingEx && (
            <Text style={[s.empty, { color: t.muted }]}>Sin ejercicios. Tocá Agregar para empezar.</Text>
          )}

          {exercises.map(ex => (
            <View key={ex.id} style={[s.exCard, { borderColor: t.border }]}>
              <View style={s.exNameRow}>
                <TextInput
                  style={[s.exNameInput, { color: t.text, borderColor: t.border, backgroundColor: t.input }]}
                  value={ex.name}
                  onChangeText={n => updateExName(ex.id, n)}
                />
                <TouchableOpacity onPress={() => removeExercise(ex.id)} style={s.dangerBtn}>
                  <Ionicons name="trash-outline" size={15} color={t.danger} />
                </TouchableOpacity>
              </View>

              {/* Sets header */}
              <View style={s.setsHeader}>
                <Text style={[s.setColLabel, { width: 28, color: t.muted }]}>#</Text>
                <Text style={[s.setColLabel, { flex: 1, color: t.muted }]}>KG</Text>
                <Text style={[s.setColLabel, { flex: 1, color: t.muted }]}>REPS</Text>
                <View style={{ width: 32 }} />
              </View>

              {ex.sets.map((set, si) => (
                <View key={si} style={s.setRow}>
                  <Text style={[s.setNum, { color: t.muted }]}>{si + 1}</Text>
                  <TextInput
                    style={[s.setInput, { flex: 1, color: t.text, borderColor: t.border, backgroundColor: t.input }]}
                    value={String(set.weight)}
                    onChangeText={v => updateSet(ex.id, si, "weight", v)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[s.setInput, { flex: 1, color: t.text, borderColor: t.border, backgroundColor: t.input }]}
                    value={String(set.reps)}
                    onChangeText={v => updateSet(ex.id, si, "reps", v)}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity onPress={() => removeSet(ex.id, si)} style={s.removeSetBtn}>
                    <Ionicons name="close" size={13} color={t.muted} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity onPress={() => addSet(ex.id)} style={s.addSetBtn}>
                <Ionicons name="add" size={13} color={t.muted} />
                <Text style={[s.addSetText, { color: t.muted }]}>Serie</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Save */}
        <TouchableOpacity style={[s.saveBtn, { backgroundColor: t.text }]} onPress={saveWorkout} disabled={saving}>
          <Ionicons name="save-outline" size={16} color={t.card} />
          <Text style={[s.saveBtnText, { color: t.card }]}>
            {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar entrenamiento"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: t.text, letterSpacing: -0.5 },
  dateNav: { flexDirection: "row", alignItems: "center", gap: 6 },
  navBtn: { padding: 7, borderRadius: 10, borderWidth: 1.5, borderColor: t.border },
  dateLabel: { fontSize: 13, fontWeight: "600", color: t.text, minWidth: 56, textAlign: "center" },
  card: { backgroundColor: t.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: t.border },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardRowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardRowTitle: { fontSize: 15, fontWeight: "700", color: t.text },
  stepsNum: { fontSize: 28, fontWeight: "900", letterSpacing: -1 },
  stepBtns: { flexDirection: "row", gap: 10 },
  stepBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 10 },
  stepBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  resetBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: t.border },
  resetBtnText: { fontWeight: "600", fontSize: 13 },
  hint: { fontSize: 12, textAlign: "center", marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: t.text, marginBottom: 12 },
  notesInput: { borderWidth: 1.5, borderRadius: 14, padding: 12, fontSize: 14, minHeight: 80 },
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  addExBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1.5, borderColor: t.border },
  addExBtnText: { fontSize: 13, fontWeight: "600" },
  addExRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  addExInput: { flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 10, fontSize: 14 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: t.border },
  empty: { textAlign: "center", fontSize: 13, paddingVertical: 20 },
  exCard: { borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 12 },
  exNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  exNameInput: { flex: 1, borderWidth: 1.5, borderRadius: 10, padding: 8, fontSize: 14, fontWeight: "700" },
  dangerBtn: { padding: 6 },
  setsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4, paddingLeft: 2 },
  setColLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1, textAlign: "center", textTransform: "uppercase" },
  setRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  setNum: { width: 28, textAlign: "center", fontSize: 12, fontWeight: "700" },
  setInput: { borderWidth: 1.5, borderRadius: 10, padding: 8, fontSize: 14, textAlign: "center" },
  removeSetBtn: { width: 32, alignItems: "center" },
  addSetBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  addSetText: { fontSize: 12 },
  saveBtn: { marginHorizontal: 16, marginTop: 4, marginBottom: 8, borderRadius: 16, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveBtnText: { fontWeight: "700", fontSize: 16 },
});
