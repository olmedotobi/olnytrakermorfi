"use client";
import { useState } from "react";
import { searchFoods, type Food } from "@/lib/foods-db";

const MEAL_TYPES = ["Desayuno", "Almuerzo", "Cena", "Snack"];

interface Props {
  onAdd: (food: Food, grams: number, mealType: string) => Promise<void>;
  onClose: () => void;
}

export default function FoodSearch({ onAdd, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams, setGrams] = useState("100");
  const [mealType, setMealType] = useState("Almuerzo");
  const [loading, setLoading] = useState(false);

  const handleSearch = (q: string) => { setQuery(q); setResults(searchFoods(q)); setSelected(null); };
  const calc = (base: number) => Math.round((base * Number(grams)) / 100);

  const handleAdd = async () => {
    if (!selected || !grams) return;
    setLoading(true);
    await onAdd(selected, Number(grams), mealType);
    setLoading(false);
    setSelected(null); setQuery(""); setResults([]); setGrams("100");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <strong style={{ fontSize: "1.1rem" }}>Agregar alimento</strong>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <input className="input-base" type="text" placeholder="Buscar alimento..." value={query}
          onChange={e => handleSearch(e.target.value)} style={{ marginBottom: "8px" }} autoFocus />

        {results.length > 0 && !selected && (
          <div className="card" style={{ marginBottom: "12px", overflow: "hidden" }}>
            {results.map(food => (
              <button key={food.name} onClick={() => { setSelected(food); setResults([]); }}
                style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-outfit, sans-serif)" }}>
                <span>
                  <span style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--text)" }}>{food.name}</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: "6px" }}>({food.category})</span>
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, flexShrink: 0, marginLeft: "8px", color: "var(--text)" }}>{food.calories} kcal/100g</span>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <p className="label" style={{ marginBottom: "3px" }}>{selected.category.toUpperCase()}</p>
                <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)" }}>{selected.name}</p>
              </div>
              <button className="btn-ghost" onClick={() => setSelected(null)} style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cambiar</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" }}>
              {[
                { label: "KCAL", value: calc(selected.calories), unit: "" },
                { label: "PROT", value: calc(selected.protein), unit: "g" },
                { label: "CARB", value: calc(selected.carbs), unit: "g" },
                { label: "GRASA", value: calc(selected.fat), unit: "g" },
              ].map(m => (
                <div key={m.label} className="card" style={{ padding: "10px", textAlign: "center", borderRadius: "0.875rem" }}>
                  <p className="label" style={{ fontSize: "0.55rem", marginBottom: "4px" }}>{m.label}</p>
                  <p style={{ fontSize: "1.2rem", fontWeight: 800, lineHeight: 1, color: "var(--text)" }}>
                    {m.value}<span style={{ fontSize: "0.68rem", fontWeight: 400, color: "var(--text-muted)" }}>{m.unit}</span>
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <label style={{ flex: 1 }}>
                <span className="label" style={{ display: "block", marginBottom: "6px" }}>GRAMOS</span>
                <input className="input-base" type="number" value={grams} onChange={e => setGrams(e.target.value)} min="1" max="2000" style={{ textAlign: "center", fontWeight: 700 }} />
              </label>
              <label style={{ flex: 1 }}>
                <span className="label" style={{ display: "block", marginBottom: "6px" }}>COMIDA</span>
                <select className="input-base" value={mealType} onChange={e => setMealType(e.target.value)}>
                  {MEAL_TYPES.map(m => <option key={m}>{m}</option>)}
                </select>
              </label>
            </div>

            <button className="btn-primary" onClick={handleAdd} disabled={loading} style={{ width: "100%", padding: "12px" }}>
              {loading ? "Agregando..." : `Agregar ${grams}g de ${selected.name}`}
            </button>
          </div>
        )}

        {query && results.length === 0 && !selected && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "12px 0" }}>No se encontró "{query}"</p>
        )}
        {!query && !selected && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "12px 0" }}>Escribí el nombre del alimento para buscar</p>
        )}
      </div>
    </div>
  );
}
