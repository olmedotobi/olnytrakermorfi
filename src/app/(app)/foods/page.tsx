"use client";

import { useState } from "react";
import { FOODS_DB, searchFoods, type Food } from "@/lib/foods-db";
import { format } from "date-fns";

const today = format(new Date(), "yyyy-MM-dd");
const MEAL_TYPES = ["Desayuno", "Almuerzo", "Cena", "Snack"];
const CATEGORIES = ["Todos", ...Array.from(new Set(FOODS_DB.map(f => f.category)))];

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ width: "110px", flexShrink: 0, fontSize: "0.85rem", color: "var(--text)" }}>{label}</span>
      <div style={{ flex: 1, height: "4px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "999px", background: color }} />
      </div>
      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", width: "32px", textAlign: "right", flexShrink: 0 }}>{value}g</span>
    </div>
  );
}

export default function FoodsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState<Food | null>(FOODS_DB[0]);
  const [grams, setGrams] = useState("100");
  const [mealType, setMealType] = useState("Almuerzo");
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = query
    ? searchFoods(query)
    : category === "Todos" ? FOODS_DB : FOODS_DB.filter(f => f.category === category);

  const g = Number(grams) || 100;
  const calc = (base: number) => Math.round((base * g) / 100);
  const maxMacro = selected ? Math.max(selected.protein, selected.carbs, selected.fat, 1) : 1;

  const handleAdd = async () => {
    if (!selected || !grams) return;
    setLoading(true);
    const factor = g / 100;
    await fetch("/api/food-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, foodName: selected.name, grams: g, calories: Math.round(selected.calories * factor), protein: Math.round(selected.protein * factor * 10) / 10, carbs: Math.round(selected.carbs * factor * 10) / 10, fat: Math.round(selected.fat * factor * 10) / 10, mealType }),
    });
    setLoading(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <p className="label" style={{ marginBottom: "4px" }}>BIBLIOTECA</p>
      <h1 style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "4px" }}>
        Tu <span className="serif-italic">despensa</span> 🥦
      </h1>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "24px" }}>
        {FOODS_DB.length} alimentos con sus macros por cada 100g — elegí lo que te tentó hoy 😊
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>

        {/* List */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px", borderBottom: "1.5px solid var(--border)" }}>
            <input className="input-base" type="text" placeholder="Buscar alimento…"
              value={query} onChange={e => { setQuery(e.target.value); setCategory("Todos"); }}
              style={{ marginBottom: query ? "0" : "10px" }} />
            {!query && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{
                    fontSize: "0.78rem", padding: "5px 14px", borderRadius: "999px",
                    border: "none", cursor: "pointer", fontFamily: "var(--font-outfit, sans-serif)",
                    fontWeight: 600, transition: "background 0.12s",
                    background: category === cat ? "var(--text)" : "var(--bg-input)",
                    color: category === cat ? "var(--bg-card)" : "var(--text-muted)",
                  }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ maxHeight: "520px", overflowY: "auto" }}>
            {filtered.map(food => {
              const isSelected = selected?.name === food.name;
              return (
                <button key={food.name} onClick={() => { setSelected(food); setGrams("100"); setAdded(false); }}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    width: "100%", padding: "12px 18px",
                    borderBottom: "1px solid var(--border)", background: isSelected ? "var(--text)" : "none",
                    cursor: "pointer", textAlign: "left", fontFamily: "var(--font-outfit, sans-serif)",
                    transition: "background 0.1s",
                  }}>
                  <div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 500, color: isSelected ? "var(--bg-card)" : "var(--text)" }}>
                      {food.name}
                    </p>
                    <p style={{ fontSize: "0.75rem", marginTop: "2px", color: isSelected ? "rgba(255,255,255,0.55)" : "var(--text-muted)" }}>
                      P {food.protein}g · C {food.carbs}g · G {food.fat}g · {food.category}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", marginLeft: "12px", flexShrink: 0 }}>
                    <p style={{ fontSize: "1.3rem", fontWeight: 900, lineHeight: 1, color: isSelected ? "var(--bg-card)" : "var(--text)" }}>
                      {food.calories}
                    </p>
                    <p style={{ fontSize: "0.7rem", color: isSelected ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}>
                      kcal · 100g
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        <div>
          {selected ? (
            <div className="card" style={{ padding: "24px" }}>
              <p className="label" style={{ marginBottom: "4px" }}>{selected.category.toUpperCase()}</p>
              <h2 className="serif-italic" style={{ fontSize: "1.6rem", color: "var(--text)", lineHeight: 1.1, marginBottom: "20px", fontWeight: 400 }}>
                {selected.name}
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "20px" }}>
                {[
                  { label: "KCAL", value: calc(selected.calories), unit: "" },
                  { label: "PROT", value: calc(selected.protein), unit: "g" },
                  { label: "CARB", value: calc(selected.carbs), unit: "g" },
                  { label: "GRASA", value: calc(selected.fat), unit: "g" },
                ].map(m => (
                  <div key={m.label} className="card" style={{ padding: "10px", textAlign: "center", borderRadius: "0.875rem" }}>
                    <p className="label" style={{ fontSize: "0.55rem", marginBottom: "4px" }}>{m.label}</p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 900, lineHeight: 1, color: "var(--text)" }}>
                      {m.value}<span style={{ fontSize: "0.68rem", fontWeight: 400, color: "var(--text-muted)" }}>{m.unit}</span>
                    </p>
                  </div>
                ))}
              </div>

              <p className="label" style={{ marginBottom: "8px" }}>PORCIÓN</p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "20px" }}>
                <input className="input-base" type="number" min="1" max="2000"
                  value={grams} onChange={e => setGrams(e.target.value)}
                  style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: "1.1rem" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, padding: "10px 14px", borderRadius: "0.875rem", background: "var(--bg-input)", color: "var(--text-muted)", flexShrink: 0 }}>
                  gramos
                </span>
              </div>

              <p className="label" style={{ marginBottom: "12px" }}>MACROS POR 100G</p>
              <MacroBar label="Proteína" value={selected.protein} max={maxMacro} color="var(--protein)" />
              <MacroBar label="Carbohidratos" value={selected.carbs} max={maxMacro} color="var(--carbs)" />
              <MacroBar label="Grasas" value={selected.fat} max={maxMacro} color="var(--fat)" />
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "20px", marginTop: "4px" }}>
                Proteína = 4 kcal/g · Carbos = 4 kcal/g · Grasas = 9 kcal/g
              </p>

              <select className="input-base" value={mealType} onChange={e => setMealType(e.target.value)} style={{ marginBottom: "12px" }}>
                {MEAL_TYPES.map(m => <option key={m}>{m}</option>)}
              </select>

              <button className="btn-primary" onClick={handleAdd} disabled={loading || added} style={{ width: "100%", padding: "12px" }}>
                {added ? "✓ Agregado al dashboard" : `Agregar ${grams}g de ${selected.name}`}
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "2.5rem", marginBottom: "10px" }}>👈</p>
              <p style={{ fontWeight: 600, color: "var(--text)" }}>Seleccioná un alimento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
