"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateBMR, calculateTDEE, calculateMacros, type ActivityLevel } from "@/lib/calc";

const ACTIVITY = [
  { value: "sedentary",   label: "Sedentario",  sub: "sin ejercicio" },
  { value: "light",       label: "Ligero",       sub: "1–3 días / semana" },
  { value: "moderate",    label: "Moderado",     sub: "3–5 días / semana" },
  { value: "active",      label: "Activo",       sub: "6–7 días / semana" },
  { value: "very_active", label: "Muy Activo",   sub: "2 veces / día" },
] as const;

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "1";

  const [form, setForm] = useState({
    height: "", weight: "", age: "", gender: "male",
    targetWeight: "", activityLevel: "moderate" as ActivityLevel,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(p => {
      if (p) setForm({ height: String(p.height), weight: String(p.weight), age: String(p.age), gender: p.gender, targetWeight: String(p.targetWeight), activityLevel: p.activityLevel });
    });
  }, []);

  const bmr = form.weight && form.height && form.age
    ? calculateBMR(Number(form.weight), Number(form.height), Number(form.age), form.gender) : null;
  const tdee = bmr ? calculateTDEE(bmr, form.activityLevel) : null;
  const macros = tdee ? calculateMacros(tdee) : null;
  const deficit = 500;
  const adjustedCal = tdee ? tdee - deficit : null;
  const weightDiff = form.weight && form.targetWeight ? Math.abs(Number(form.weight) - Number(form.targetWeight)) : 0;
  const weeksToGoal = Math.round(weightDiff / 0.45);
  const losing = form.weight && form.targetWeight && Number(form.weight) > Number(form.targetWeight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ height: Number(form.height), weight: Number(form.weight), age: Number(form.age), gender: form.gender, targetWeight: Number(form.targetWeight), activityLevel: form.activityLevel }) });
    setLoading(false);
    setSaved(true);
    setTimeout(() => { if (isSetup) router.push("/dashboard"); else setSaved(false); }, 1500);
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const inputFields = [
    { key: "height",       label: "ALTURA (CM)",        type: "number", placeholder: "180", min: "100", max: "250" },
    { key: "weight",       label: "PESO ACTUAL (KG)",   type: "number", placeholder: "70",  min: "30",  max: "300", step: "0.1" },
    { key: "age",          label: "EDAD (AÑOS)",        type: "number", placeholder: "25",  min: "10",  max: "120" },
    { key: "targetWeight", label: "PESO OBJETIVO (KG)", type: "number", placeholder: "65",  min: "30",  max: "300", step: "0.1" },
  ];

  return (
    <div>
      <p className="label" style={{ marginBottom: "4px" }}>TU CUENTA</p>
      <h1 style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "4px" }}>
        Tu <span className="serif-italic">perfil</span> 👋
      </h1>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "28px" }}>
        Actualizá tus datos para que tus metas se ajusten a vos 🎯
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            <div className="card" style={{ padding: "24px" }}>
              <p className="label" style={{ marginBottom: "4px" }}>DATOS PERSONALES</p>
              <h2 className="serif-italic" style={{ fontSize: "1.4rem", color: "var(--text)", marginBottom: "20px", fontWeight: 400 }}>Sobre vos</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {inputFields.map(field => (
                  <label key={field.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="label">{field.label}</span>
                    <input className="input-base" type={field.type} placeholder={field.placeholder}
                      min={field.min} max={field.max} step={"step" in field ? field.step : undefined}
                      value={form[field.key as keyof typeof form]}
                      onChange={f(field.key)} required />
                  </label>
                ))}
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
                  <span className="label">GÉNERO</span>
                  <select className="input-base" value={form.gender} onChange={f("gender")}>
                    <option value="male">masculino</option>
                    <option value="female">femenino</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <p className="label" style={{ marginBottom: "4px" }}>NIVEL DE ACTIVIDAD</p>
              <h2 className="serif-italic" style={{ fontSize: "1.2rem", color: "var(--text)", marginBottom: "16px", fontWeight: 400 }}>¿Qué tan activa es tu semana?</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {ACTIVITY.map(a => {
                  const isSelected = form.activityLevel === a.value;
                  return (
                    <label key={a.value} style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 16px", borderRadius: "0.875rem", cursor: "pointer",
                      background: isSelected ? "var(--text)" : "var(--bg-input)",
                      transition: "background 0.15s",
                    }}>
                      <input type="radio" name="activityLevel" value={a.value}
                        checked={isSelected}
                        onChange={() => setForm(p => ({ ...p, activityLevel: a.value as ActivityLevel }))}
                        style={{ flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: isSelected ? "var(--bg-card)" : "var(--text)" }}>{a.label}</p>
                        <p style={{ fontSize: "0.76rem", color: isSelected ? "rgba(255,255,255,0.55)" : "var(--text-muted)" }}>{a.sub}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading || saved} style={{ padding: "14px", fontSize: "1rem" }}>
              {saved ? "✓ Guardado" : loading ? "Guardando..." : isSetup ? "Guardar y continuar →" : "Actualizar perfil"}
            </button>
          </div>

          {/* Right column */}
          {tdee && macros ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="card" style={{ padding: "24px" }}>
                <p className="label" style={{ marginBottom: "4px" }}>TU METABOLISMO CALCULADO</p>
                <h2 className="serif-italic" style={{ fontSize: "1.4rem", color: "var(--text)", marginBottom: "20px", fontWeight: 400 }}>Tus números, hoy</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { label: "CALORÍAS", value: adjustedCal ?? tdee, unit: "kcal/d", bg: "var(--salmon-bg)", color: "var(--salmon)" },
                    { label: "PROTEÍNA", value: macros.protein,       unit: "g",      bg: "var(--lavender-bg)", color: "var(--lavender)" },
                    { label: "CARBOS",   value: macros.carbs,         unit: "g",      bg: "var(--carbs-bg)",   color: "var(--carbs)" },
                    { label: "GRASAS",   value: macros.fat,           unit: "g",      bg: "var(--fat-bg)",     color: "var(--fat)" },
                  ].map(m => (
                    <div key={m.label} style={{ borderRadius: "1rem", padding: "16px", background: m.bg }}>
                      <p className="label" style={{ color: m.color, fontSize: "0.6rem", marginBottom: "8px" }}>{m.label}</p>
                      <p style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1, color: "var(--text)" }}>
                        {m.value}<span style={{ fontSize: "0.85rem", fontWeight: 400, marginLeft: "4px", color: m.color }}>{m.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "14px" }}>
                  Calculado con Mifflin-St Jeor · BMR: {Math.round(bmr!)} kcal/d · TDEE: {tdee} kcal/d · déficit {deficit}.
                </p>
              </div>

              {weightDiff > 0 && (
                <div style={{ borderRadius: "1.25rem", padding: "24px", background: "var(--mint-bg)", border: "1.5px solid rgba(45,170,126,0.2)" }}>
                  <p className="label" style={{ color: "var(--mint)", fontSize: "0.6rem", marginBottom: "8px" }}>🎯 TU OBJETIVO</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 900, lineHeight: 1, color: "var(--text)", marginBottom: "8px" }}>
                    {losing ? "Bajar" : "Subir"} {weightDiff.toFixed(1)} kg
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                    A ritmo actual (~0.45 kg/sem) llegarías en{" "}
                    <strong style={{ color: "var(--text)" }}>{weeksToGoal} semanas</strong>.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "10px", minHeight: "300px" }}>
              <p style={{ fontSize: "3rem" }}>📊</p>
              <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>Completá tus datos</p>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Al llenar el formulario verás aquí tu metabolismo calculado</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<p style={{ padding: "40px", color: "var(--text-muted)" }}>Cargando...</p>}>
      <ProfileContent />
    </Suspense>
  );
}
