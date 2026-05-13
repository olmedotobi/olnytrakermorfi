"use client";

import { useState, useEffect } from "react";
import { FOODS_DB, type Food } from "@/lib/foods-db";
import { format } from "date-fns";
import { Plus, Trash2, ChefHat, BookOpen, Star } from "lucide-react";

const today = format(new Date(), "yyyy-MM-dd");
const MEAL_TYPES = ["Desayuno", "Almuerzo", "Cena", "Snack"];
const ALL_CATEGORIES = ["Todos", ...Array.from(new Set(FOODS_DB.map(f => f.category)))];

type CustomFood = { id: string; name: string; calories: number; protein: number; carbs: number; fat: number; category: string };
type RecipeIngredient = { food: Food; grams: number };
type Tab = "biblioteca" | "mis-alimentos" | "crear";

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ width: "90px", flexShrink: 0, fontSize: "0.82rem", color: "var(--text)" }}>{label}</span>
      <div style={{ flex: 1, height: "4px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "999px", background: color, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", width: "30px", textAlign: "right", flexShrink: 0 }}>{value}g</span>
    </div>
  );
}

function MacroBadges({ cal, p, c, f, size = "normal" }: { cal: number; p: number; c: number; f: number; size?: "small" | "normal" }) {
  const fs = size === "small" ? "0.7rem" : "0.75rem";
  const items = [
    { label: "P", val: p, color: "var(--lavender)" },
    { label: "C", val: c, color: "var(--carbs)" },
    { label: "G", val: f, color: "var(--fat)" },
  ];
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: fs, fontWeight: 700, color: "var(--salmon)" }}>{cal} kcal</span>
      {items.map(i => (
        <span key={i.label} style={{ fontSize: fs, color: i.color, fontWeight: 600 }}>{i.label}:{i.val}g</span>
      ))}
    </div>
  );
}

export default function FoodsPage() {
  const [tab, setTab] = useState<Tab>("biblioteca");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState<Food | CustomFood | null>(FOODS_DB[0]);
  const [grams, setGrams] = useState("100");
  const [mealType, setMealType] = useState("Almuerzo");
  const [added, setAdded] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Mis alimentos
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  // Crear alimento simple
  const [newFood, setNewFood] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", category: "Personalizado" });
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // Mezclador de receta
  const [recipeMode, setRecipeMode] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [recipeGrams, setRecipeGrams] = useState("100");

  useEffect(() => {
    setLoadingCustom(true);
    fetch("/api/custom-foods").then(r => r.json()).then(d => { setCustomFoods(Array.isArray(d) ? d : []); setLoadingCustom(false); });
  }, []);

  const allFoods: Food[] = [...FOODS_DB, ...customFoods.map(c => ({ ...c }))];

  const filteredLib = query
    ? allFoods.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).slice(0, 20)
    : category === "Todos" ? FOODS_DB : FOODS_DB.filter(f => f.category === category);

  const filteredRecipeSearch = recipeSearch
    ? allFoods.filter(f => f.name.toLowerCase().includes(recipeSearch.toLowerCase())).slice(0, 8)
    : [];

  const g = Number(grams) || 100;
  const calc = (base: number) => Math.round((base * g) / 100 * 10) / 10;
  const maxMacro = selected ? Math.max((selected as Food).protein, (selected as Food).carbs, (selected as Food).fat, 1) : 1;

  const recipeTotals = recipeIngredients.reduce(
    (acc, { food, grams: gr }) => {
      const f = gr / 100;
      return { calories: acc.calories + food.calories * f, protein: acc.protein + food.protein * f, carbs: acc.carbs + food.carbs * f, fat: acc.fat + food.fat * f };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const recipeTotalGrams = recipeIngredients.reduce((s, i) => s + i.grams, 0);

  const handleAddToLog = async () => {
    if (!selected || !grams) return;
    setAddLoading(true);
    const s = selected as Food;
    const factor = g / 100;
    await fetch("/api/food-entries", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, foodName: s.name, grams: g, calories: Math.round(s.calories * factor), protein: Math.round(s.protein * factor * 10) / 10, carbs: Math.round(s.carbs * factor * 10) / 10, fat: Math.round(s.fat * factor * 10) / 10, mealType }),
    });
    setAddLoading(false); setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleSaveCustomFood = async () => {
    if (!newFood.name || !newFood.calories) return;
    setSaveLoading(true);
    const saved = await fetch("/api/custom-foods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newFood) }).then(r => r.json());
    setCustomFoods(p => [saved, ...p]);
    setNewFood({ name: "", calories: "", protein: "", carbs: "", fat: "", category: "Personalizado" });
    setSaveLoading(false); setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2200);
  };

  const handleDeleteCustom = async (id: string) => {
    await fetch(`/api/custom-foods?id=${id}`, { method: "DELETE" });
    setCustomFoods(p => p.filter(f => f.id !== id));
  };

  const handleSaveRecipe = async () => {
    if (!recipeName || recipeIngredients.length === 0) return;
    setSaveLoading(true);
    const per100 = recipeTotalGrams > 0 ? 100 / recipeTotalGrams : 1;
    const saved = await fetch("/api/custom-foods", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: recipeName, calories: Math.round(recipeTotals.calories * per100), protein: Math.round(recipeTotals.protein * per100 * 10) / 10, carbs: Math.round(recipeTotals.carbs * per100 * 10) / 10, fat: Math.round(recipeTotals.fat * per100 * 10) / 10, category: "Receta" }),
    }).then(r => r.json());
    setCustomFoods(p => [saved, ...p]);
    setRecipeIngredients([]); setRecipeName(""); setRecipeSearch("");
    setSaveLoading(false); setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2200);
  };

  const nf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setNewFood(p => ({ ...p, [k]: e.target.value }));

  const TABS = [
    { id: "biblioteca" as Tab, label: "Biblioteca", icon: BookOpen },
    { id: "mis-alimentos" as Tab, label: "Mis alimentos", icon: Star },
    { id: "crear" as Tab, label: "Crear", icon: Plus },
  ];

  return (
    <div className="anim-page">
      <p className="label" style={{ marginBottom: "4px" }}>ALIMENTOS</p>
      <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "4px" }}>
        Tu <span className="serif-italic">despensa</span> 🥦
      </h1>
      <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "20px" }}>
        {FOODS_DB.length} alimentos · {customFoods.length} personalizados
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 18px", borderRadius: "999px", border: "none",
              cursor: "pointer", fontFamily: "var(--font-outfit, sans-serif)",
              fontSize: "0.85rem", fontWeight: 600, transition: "all 0.15s",
              background: active ? "var(--text)" : "var(--bg-input)",
              color: active ? "var(--bg-card)" : "var(--text-muted)",
            }}>
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── BIBLIOTECA ── */}
      {tab === "biblioteca" && (
        <div className="foods-grid">
          {/* Lista */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px", borderBottom: "1.5px solid var(--border)" }}>
              <input className="input-base" type="text" placeholder="Buscar alimento…"
                value={query} onChange={e => { setQuery(e.target.value); setCategory("Todos"); }}
                style={{ marginBottom: query ? "0" : "10px" }} />
              {!query && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "4px" }}>
                  {ALL_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} style={{
                      fontSize: "0.73rem", padding: "4px 12px", borderRadius: "999px", border: "none",
                      cursor: "pointer", fontFamily: "var(--font-outfit, sans-serif)", fontWeight: 600,
                      background: category === cat ? "var(--text)" : "var(--bg-input)",
                      color: category === cat ? "var(--bg-card)" : "var(--text-muted)",
                    }}>{cat}</button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ maxHeight: "480px", overflowY: "auto" }}>
              {filteredLib.map(food => {
                const isSel = selected?.name === food.name;
                return (
                  <button key={food.name} onClick={() => { setSelected(food); setGrams("100"); setAdded(false); }}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "12px 16px", borderBottom: "1px solid var(--border)", background: isSel ? "var(--text)" : "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-outfit, sans-serif)" }}>
                    <div>
                      <p style={{ fontSize: "0.88rem", fontWeight: 500, color: isSel ? "var(--bg-card)" : "var(--text)" }}>{food.name}</p>
                      <p style={{ fontSize: "0.72rem", marginTop: "2px", color: isSel ? "rgba(255,255,255,0.55)" : "var(--text-muted)" }}>
                        P {food.protein}g · C {food.carbs}g · G {food.fat}g
                      </p>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: "10px", flexShrink: 0 }}>
                      <p style={{ fontSize: "1.2rem", fontWeight: 900, lineHeight: 1, color: isSel ? "var(--bg-card)" : "var(--text)" }}>{food.calories}</p>
                      <p style={{ fontSize: "0.65rem", color: isSel ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}>kcal/100g</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detalle */}
          <div className="foods-detail">
            {selected ? (
              <div className="card" style={{ padding: "22px" }}>
                <p className="label" style={{ marginBottom: "3px" }}>{(selected as Food).category?.toUpperCase()}</p>
                <h2 className="serif-italic" style={{ fontSize: "1.4rem", color: "var(--text)", lineHeight: 1.15, marginBottom: "18px", fontWeight: 400 }}>{selected.name}</h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "7px", marginBottom: "18px" }}>
                  {[
                    { label: "KCAL", value: calc((selected as Food).calories), unit: "" },
                    { label: "PROT", value: calc((selected as Food).protein), unit: "g" },
                    { label: "CARB", value: calc((selected as Food).carbs), unit: "g" },
                    { label: "GRAS", value: calc((selected as Food).fat), unit: "g" },
                  ].map(m => (
                    <div key={m.label} className="card" style={{ padding: "9px", textAlign: "center" }}>
                      <p className="label" style={{ fontSize: "0.52rem", marginBottom: "3px" }}>{m.label}</p>
                      <p style={{ fontSize: "1.15rem", fontWeight: 900, lineHeight: 1 }}>{m.value}<span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{m.unit}</span></p>
                    </div>
                  ))}
                </div>

                <p className="label" style={{ marginBottom: "7px" }}>PORCIÓN (gramos)</p>
                <div style={{ display: "flex", gap: "7px", alignItems: "center", marginBottom: "16px" }}>
                  <input className="input-base" type="number" min="1" max="2000" value={grams}
                    onChange={e => setGrams(e.target.value)}
                    style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: "1.1rem" }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, padding: "10px 12px", borderRadius: "0.875rem", background: "var(--bg-input)", color: "var(--text-muted)", flexShrink: 0 }}>g</span>
                </div>

                <p className="label" style={{ marginBottom: "8px" }}>MACROS / 100G</p>
                <MacroBar label="Proteína" value={(selected as Food).protein} max={maxMacro} color="var(--protein)" />
                <MacroBar label="Carbos" value={(selected as Food).carbs} max={maxMacro} color="var(--carbs)" />
                <MacroBar label="Grasas" value={(selected as Food).fat} max={maxMacro} color="var(--fat)" />

                <select className="input-base" value={mealType} onChange={e => setMealType(e.target.value)} style={{ marginTop: "14px", marginBottom: "10px" }}>
                  {MEAL_TYPES.map(m => <option key={m}>{m}</option>)}
                </select>
                <button className="btn-primary" onClick={handleAddToLog} disabled={addLoading || added} style={{ width: "100%", padding: "12px" }}>
                  {added ? "✓ Agregado al dashboard" : `Agregar ${grams}g`}
                </button>
              </div>
            ) : (
              <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <p style={{ fontSize: "2.5rem", marginBottom: "10px" }}>👆</p>
                <p style={{ fontWeight: 600, color: "var(--text)" }}>Seleccioná un alimento</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MIS ALIMENTOS ── */}
      {tab === "mis-alimentos" && (
        <div>
          {loadingCustom ? (
            <p style={{ color: "var(--text-muted)", padding: "40px 0" }}>Cargando…</p>
          ) : customFoods.length === 0 ? (
            <div className="card" style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ fontSize: "3rem", marginBottom: "12px" }}>🍳</p>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "6px" }}>Sin alimentos personalizados</p>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "20px" }}>Creá tus propios alimentos o recetas en la pestaña Crear</p>
              <button className="btn-primary" onClick={() => setTab("crear")} style={{ padding: "10px 24px" }}>
                + Crear primer alimento
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {customFoods.map(food => (
                <div key={food.id} className="card" style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{food.name}</p>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: food.category === "Receta" ? "var(--mint-bg)" : "var(--lavender-bg)", color: food.category === "Receta" ? "var(--mint)" : "var(--lavender)" }}>
                        {food.category}
                      </span>
                    </div>
                    <MacroBadges cal={food.calories} p={food.protein} c={food.carbs} f={food.fat} size="small" />
                    <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>por 100g</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button onClick={() => { setSelected(food); setGrams("100"); setTab("biblioteca"); }} style={{ padding: "8px 14px", borderRadius: "0.75rem", background: "var(--bg-input)", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, fontFamily: "var(--font-outfit, sans-serif)", color: "var(--text)" }}>
                      Usar
                    </button>
                    <button onClick={() => handleDeleteCustom(food.id)} style={{ padding: "8px", borderRadius: "0.75rem", background: "none", border: "1.5px solid var(--border)", cursor: "pointer", color: "var(--danger)", display: "flex", alignItems: "center" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CREAR ── */}
      {tab === "crear" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Toggle simple / receta */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => setRecipeMode(false)} style={{ flex: 1, padding: "10px", borderRadius: "0.875rem", border: "none", cursor: "pointer", fontFamily: "var(--font-outfit, sans-serif)", fontWeight: 600, fontSize: "0.85rem", background: !recipeMode ? "var(--text)" : "var(--bg-input)", color: !recipeMode ? "var(--bg-card)" : "var(--text-muted)" }}>
              Alimento simple
            </button>
            <button onClick={() => setRecipeMode(true)} style={{ flex: 1, padding: "10px", borderRadius: "0.875rem", border: "none", cursor: "pointer", fontFamily: "var(--font-outfit, sans-serif)", fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: recipeMode ? "var(--text)" : "var(--bg-input)", color: recipeMode ? "var(--bg-card)" : "var(--text-muted)" }}>
              <ChefHat size={14} />
              Mezcla / Receta
            </button>
          </div>

          {!recipeMode ? (
            <div className="card" style={{ padding: "24px" }}>
              <p className="label" style={{ marginBottom: "16px" }}>NUEVO ALIMENTO PERSONALIZADO</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span className="label">NOMBRE</span>
                  <input className="input-base" placeholder="Ej: Batido casero de banana" value={newFood.name} onChange={nf("name")} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { key: "calories", label: "CALORÍAS (kcal)" },
                    { key: "protein",  label: "PROTEÍNA (g)" },
                    { key: "carbs",    label: "CARBOS (g)" },
                    { key: "fat",      label: "GRASAS (g)" },
                  ].map(f => (
                    <label key={f.key} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <span className="label">{f.label}</span>
                      <input className="input-base" type="number" min="0" placeholder="0"
                        value={newFood[f.key as keyof typeof newFood]} onChange={nf(f.key)} />
                    </label>
                  ))}
                </div>
                <label style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span className="label">CATEGORÍA</span>
                  <select className="input-base" value={newFood.category} onChange={nf("category")}>
                    <option>Personalizado</option>
                    <option>Proteína</option>
                    <option>Carbohidratos</option>
                    <option>Verduras</option>
                    <option>Frutas</option>
                    <option>Grasas</option>
                    <option>Lácteos</option>
                    <option>Bebidas</option>
                    <option>Comidas</option>
                  </select>
                </label>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Todos los valores son por cada 100g del alimento.</p>
                <button className="btn-primary" onClick={handleSaveCustomFood} disabled={saveLoading || savedOk || !newFood.name} style={{ padding: "12px" }}>
                  {savedOk ? "✓ Guardado en Mis alimentos" : saveLoading ? "Guardando…" : "Guardar alimento"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="card" style={{ padding: "24px" }}>
                <p className="label" style={{ marginBottom: "12px" }}>NOMBRE DE LA RECETA</p>
                <input className="input-base" placeholder="Ej: Bowl de proteína post-entreno" value={recipeName} onChange={e => setRecipeName(e.target.value)} />
              </div>

              <div className="card" style={{ padding: "24px" }}>
                <p className="label" style={{ marginBottom: "12px" }}>AGREGAR INGREDIENTES</p>
                <input className="input-base" placeholder="Buscar alimento para agregar…" value={recipeSearch}
                  onChange={e => setRecipeSearch(e.target.value)} style={{ marginBottom: "10px" }} />
                {filteredRecipeSearch.length > 0 && (
                  <div style={{ border: "1.5px solid var(--border)", borderRadius: "0.875rem", overflow: "hidden", marginBottom: "12px" }}>
                    {filteredRecipeSearch.map(food => (
                      <button key={food.name} onClick={() => { setRecipeIngredients(p => [...p, { food, grams: 100 }]); setRecipeSearch(""); }}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-outfit, sans-serif)" }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{food.name}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{food.calories} kcal/100g</span>
                      </button>
                    ))}
                  </div>
                )}

                {recipeIngredients.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {recipeIngredients.map((ing, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "0.875rem", background: "var(--bg-input)" }}>
                        <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500 }}>{ing.food.name}</span>
                        <input type="number" min="1" max="2000" value={ing.grams}
                          onChange={e => setRecipeIngredients(p => p.map((i, j) => j === idx ? { ...i, grams: Number(e.target.value) || 0 } : i))}
                          style={{ width: "64px", padding: "5px 8px", borderRadius: "0.625rem", border: "1.5px solid var(--border)", background: "var(--bg-card)", fontFamily: "var(--font-outfit, sans-serif)", fontSize: "0.88rem", textAlign: "center" }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>g</span>
                        <button onClick={() => setRecipeIngredients(p => p.filter((_, j) => j !== idx))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {recipeIngredients.length > 0 && (
                <div className="card" style={{ padding: "20px", background: "var(--mint-bg)", borderColor: "transparent" }}>
                  <p className="label" style={{ color: "var(--mint)", marginBottom: "10px" }}>TOTALES DE LA RECETA ({recipeTotalGrams}g)</p>
                  <MacroBadges cal={Math.round(recipeTotals.calories)} p={Math.round(recipeTotals.protein * 10) / 10} c={Math.round(recipeTotals.carbs * 10) / 10} f={Math.round(recipeTotals.fat * 10) / 10} />
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "8px" }}>
                    Se guarda normalizado a 100g → {recipeTotalGrams > 0 ? Math.round(recipeTotals.calories * 100 / recipeTotalGrams) : 0} kcal/100g
                  </p>
                </div>
              )}

              <button className="btn-primary" onClick={handleSaveRecipe}
                disabled={saveLoading || savedOk || !recipeName || recipeIngredients.length === 0}
                style={{ padding: "13px" }}>
                {savedOk ? "✓ Receta guardada" : saveLoading ? "Guardando…" : <><ChefHat size={15} style={{ marginRight: 6 }} />Guardar receta</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
