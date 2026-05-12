"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CalorieRing from "@/components/CalorieRing";
import MacroBars from "@/components/MacroBars";
import FoodSearch from "@/components/FoodSearch";
import WeatherMotivation from "@/components/WeatherMotivation";
import { calculateBMR, calculateTDEE, calculateMacros, adjustedCalorieGoal, type ActivityLevel } from "@/lib/calc";
import type { Food } from "@/lib/foods-db";

type Profile = { height: number; weight: number; age: number; gender: string; targetWeight: number; activityLevel: string };
type FoodEntry = { id: string; foodName: string; grams: number; calories: number; protein: number; carbs: number; fat: number; mealType: string };

const today = format(new Date(), "yyyy-MM-dd");
const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
const MEALS = ["Desayuno", "Almuerzo", "Cena", "Snack"] as const;

const QUOTES = [
  "El progreso vive entre la disciplina y el descanso.",
  "Cada comida es una oportunidad de nutrir tu cuerpo.",
  "Lo que hacés hoy define cómo te sentís mañana.",
  "La constancia supera al talento, siempre.",
  "Un paso a la vez, una comida a la vez.",
  "Tu cuerpo es tu proyecto más importante.",
  "Comer bien no es una restricción, es un regalo.",
];
const quote = QUOTES[new Date().getDate() % QUOTES.length];

const STAT_COLORS = [
  { label: "CONSUMIDAS", icon: "🔥", unit: "kcal", bg: "var(--salmon-bg)", color: "var(--salmon)" },
  { label: "RESTANTES",  icon: "🍃", unit: "kcal", bg: "var(--mint-bg)",   color: "var(--mint)" },
  { label: "META DIARIA",icon: "🎯", unit: "kcal", bg: "var(--lavender-bg)", color: "var(--lavender)" },
  { label: "PARA META",  icon: "🌿", unit: "kg",   bg: "var(--sky-bg)",    color: "var(--sky)" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0]?.toLowerCase() ?? "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [weight, setWeight] = useState("");
  const [weightSaved, setWeightSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then(r => r.json()),
      fetch(`/api/food-entries?date=${today}`).then(r => r.json()),
    ]).then(([p, e]) => { setProfile(p); setEntries(e || []); setLoading(false); });
  }, []);

  const goals = profile ? (() => {
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel as ActivityLevel);
    const cal = adjustedCalorieGoal(tdee, profile.weight, profile.targetWeight);
    return { calories: cal, tdee, ...calculateMacros(cal) };
  })() : { calories: 2000, tdee: 2000, protein: 125, carbs: 225, fat: 67 };

  const totals = entries.reduce(
    (a, e) => ({ calories: a.calories + e.calories, protein: a.protein + e.protein, carbs: a.carbs + e.carbs, fat: a.fat + e.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const consumed = Math.round(totals.calories);
  const remaining = Math.max(goals.calories - consumed, 0);
  const over = consumed > goals.calories;
  const weightDiff = profile ? Math.abs(profile.weight - profile.targetWeight) : 0;
  const weeksToGoal = Math.round(weightDiff / 0.45);

  const addFood = async (food: Food, grams: number, mealType: string) => {
    const f = grams / 100;
    const body = { date: today, foodName: food.name, grams, calories: Math.round(food.calories * f), protein: Math.round(food.protein * f * 10) / 10, carbs: Math.round(food.carbs * f * 10) / 10, fat: Math.round(food.fat * f * 10) / 10, mealType };
    const saved = await fetch("/api/food-entries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
    setEntries(p => [...p, saved]);
    setShowSearch(false);
  };

  const deleteEntry = async (id: string) => {
    await fetch(`/api/food-entries?id=${id}`, { method: "DELETE" });
    setEntries(p => p.filter(e => e.id !== id));
  };

  const saveWeight = async () => {
    if (!weight || isNaN(Number(weight))) return;
    await fetch("/api/weight-entries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: today, weight: Number(weight) }) });
    setWeightSaved(true);
    setTimeout(() => setWeightSaved(false), 2500);
  };

  const byMeal = entries.reduce((acc, e) => { (acc[e.mealType] ??= []).push(e); return acc; }, {} as Record<string, FoodEntry[]>);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", color: "var(--text-muted)" }}>
      Cargando...
    </div>
  );

  const statValues = [
    consumed,
    remaining,
    goals.calories,
    weightDiff,
  ];
  const statSubs = [
    `de ${goals.calories} kcal · ${goals.calories > 0 ? Math.round((consumed / goals.calories) * 100) : 0}%`,
    "hasta cierre del día",
    profile ? `déficit de ${goals.tdee - goals.calories} kcal` : "configurá tu perfil",
    profile ? `${profile.weight} kg → ${profile.targetWeight} kg` : "—",
  ];

  return (
    <div>
      {/* Header */}
      <p className="label" style={{ marginBottom: "6px", textTransform: "capitalize" }}>{todayLabel}</p>
      <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "8px" }}>
        ¡Hola{firstName ? ", " : ""}
        {firstName && <span className="serif-italic">{firstName}</span>}! {over ? "🚨" : "👋"}
      </h1>
      <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "24px" }}>
        Hoy llevás <strong style={{ color: "var(--text)" }}>{consumed} kcal</strong> de tu objetivo de {goals.calories}. Vas {goals.calories > 0 ? Math.round((consumed / goals.calories) * 100) : 0}% del día —{" "}
        {over ? "límite alcanzado 🚨" : "vamos bien 🌱"}
      </p>

      {!profile && (
        <div style={{ background: "var(--salmon-bg)", border: "1.5px solid rgba(232,112,74,0.3)", borderRadius: "1rem", padding: "12px 16px", marginBottom: "24px", fontSize: "0.9rem", color: "var(--salmon)" }}>
          ⚠️ Completá tu <a href="/profile" style={{ color: "var(--salmon)", fontWeight: 700 }}>perfil</a> para calcular tus calorías personalizadas.
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {STAT_COLORS.map((s, i) => (
          <div key={s.label} className="card" style={{ padding: "20px 18px", background: s.bg, borderColor: "transparent" }}>
            <p className="label" style={{ color: s.color, marginBottom: "10px" }}>{s.icon} {s.label}</p>
            <p style={{ fontSize: "2.2rem", fontWeight: 900, lineHeight: 1, color: "var(--text)" }}>
              {typeof statValues[i] === "number" && s.unit === "kg"
                ? (statValues[i] as number).toFixed(1)
                : Math.round(statValues[i] as number)}
              <span style={{ fontSize: "0.9rem", fontWeight: 400, color: s.color, marginLeft: "4px" }}>{s.unit}</span>
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "6px" }}>{statSubs[i]}</p>
          </div>
        ))}
      </div>

      {/* Main 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr", gap: "16px", marginBottom: "24px" }}>

        {/* Col 1 — Balance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="card" style={{ padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p className="label">BALANCE DEL DÍA</p>
              {profile && goals.tdee > goals.calories && (
                <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "var(--bg-input)", color: "var(--text-muted)" }}>
                  déficit {goals.tdee - goals.calories}
                </span>
              )}
            </div>
            <CalorieRing consumed={consumed} goal={goals.calories} />
          </div>

          {profile && (
            <div className="card" style={{ padding: "22px" }}>
              <p className="label" style={{ marginBottom: "8px" }}>PLAN DE OBJETIVO</p>
              <p style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "6px" }}>
                {profile.weight > profile.targetWeight
                  ? `Déficit de ${goals.tdee - goals.calories} kcal`
                  : profile.weight < profile.targetWeight
                  ? `Superávit de ${goals.calories - goals.tdee} kcal`
                  : "Mantenimiento"}
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                meta: {profile.targetWeight} kg · actual: {profile.weight} kg · ~{weeksToGoal} sem
              </p>
            </div>
          )}
        </div>

        {/* Col 2 — Macros + Peso */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="card" style={{ padding: "22px", flex: 1 }}>
            <MacroBars
              protein={{ consumed: totals.protein, goal: goals.protein }}
              carbs={{ consumed: totals.carbs, goal: goals.carbs }}
              fat={{ consumed: totals.fat, goal: goals.fat }} />
          </div>

          <div className="card" style={{ padding: "22px" }}>
            <p className="label" style={{ marginBottom: "10px" }}>REGISTRAR PESO HOY</p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
              <input type="number" step="0.1" min="30" max="300"
                className="input-base"
                placeholder={profile ? `${profile.weight} kg` : "Tu peso en kg"}
                value={weight} onChange={e => setWeight(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveWeight()}
                style={{ flex: 1 }} />
              <button onClick={saveWeight} className="btn-primary" style={{ padding: "10px 16px", flexShrink: 0 }}>
                {weightSaved ? "✓ Guardado" : "Guardar"}
              </button>
            </div>
            {profile && (
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                {profile.weight > profile.targetWeight ? `-${weightDiff.toFixed(1)} kg` : `+${weightDiff.toFixed(1)} kg`} en {weeksToGoal} semanas
              </p>
            )}
          </div>
        </div>

        {/* Col 3 — Clima + Mood */}
        <div className="card" style={{ padding: "22px" }}>
          <WeatherMotivation />
        </div>
      </div>

      {/* Quote banner */}
      <div style={{
        borderRadius: "1.25rem",
        background: "linear-gradient(135deg, var(--banner-start) 0%, var(--banner-end) 100%)",
        padding: "40px 48px",
        textAlign: "center",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <p style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.3, marginBottom: "16px" }}>
          <span className="serif-italic">&ldquo;{quote}&rdquo;</span>
        </p>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", padding: "5px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.7)", color: "var(--text-muted)" }}>
          ✨ frase del día
        </span>
      </div>

      {/* Food log */}
      <div className="card" style={{ padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <p className="label" style={{ marginBottom: "3px" }}>REGISTRO DE HOY</p>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>{entries.length} alimentos</h2>
          </div>
          <button onClick={() => setShowSearch(true)} className="btn-primary">
            + Agregar
          </button>
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🍽️</p>
            <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Sin alimentos registrados</p>
            <p style={{ fontSize: "0.88rem" }}>
              Comenzá agregando tu primera comida del día{" "}
              <button onClick={() => setShowSearch(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--salmon)", fontWeight: 600, fontFamily: "var(--font-outfit, sans-serif)", fontSize: "0.88rem" }}>
                aquí →
              </button>
            </p>
          </div>
        ) : (
          <div>
            {MEALS.map(meal => {
              const list = byMeal[meal] ?? [];
              const mCal = Math.round(list.reduce((s, e) => s + e.calories, 0));
              if (list.length === 0) return null;
              return (
                <div key={meal} style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{meal}</p>
                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>{mCal} kcal</p>
                  </div>
                  <div style={{ border: "1.5px solid var(--border)", borderRadius: "1rem", overflow: "hidden" }}>
                    {list.map((e, idx) => (
                      <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderTop: idx > 0 ? "1px solid var(--border)" : "none" }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{e.foodName}</p>
                          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {e.grams}g · P:{e.protein}g C:{e.carbs}g G:{e.fat}g
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{e.calories} kcal</p>
                          <button onClick={() => deleteEntry(e.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1rem", padding: "2px 6px", borderRadius: "0.5rem" }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop: "1.5px solid var(--border)", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontWeight: 700 }}>Total del día</p>
              <p style={{ fontWeight: 700 }}>{consumed} kcal · P:{Math.round(totals.protein)}g · C:{Math.round(totals.carbs)}g · G:{Math.round(totals.fat)}g</p>
            </div>
          </div>
        )}
      </div>

      {showSearch && <FoodSearch onAdd={addFood} onClose={() => setShowSearch(false)} />}
    </div>
  );
}
