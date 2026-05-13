"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Dumbbell, Footprints, Save, X } from "lucide-react";

type Set = { reps: number; weight: number };
type Exercise = { id: string; name: string; sets: Set[] };

function today() {
  return new Date().toISOString().slice(0, 10);
}
function fmt(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
function addDays(d: string, n: number) {
  const dt = new Date(d + "T12:00:00");
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}

function cuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function TrainingPage() {
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

  const stepCountRef = useRef(0);
  const lastAccRef = useRef<number | null>(null);
  const permissionRef = useRef(false);

  // Load workout + steps for the selected date
  useEffect(() => {
    setNotes("");
    setExercises([]);
    setSteps(0);
    setSavedSteps(0);
    setSaved(false);

    fetch(`/api/workout-sessions?date=${date}`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setNotes(data.notes ?? "");
          setExercises(Array.isArray(data.exercises) ? data.exercises : JSON.parse(data.exercises ?? "[]"));
        }
      })
      .catch(() => {});

    fetch(`/api/steps?date=${date}`)
      .then(r => r.json())
      .then(data => {
        if (data?.steps) {
          setSavedSteps(data.steps);
          setSteps(data.steps);
        }
      })
      .catch(() => {});
  }, [date]);

  // Step counter via DeviceMotion
  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const magnitude = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2);
    if (lastAccRef.current !== null) {
      const delta = Math.abs(magnitude - lastAccRef.current);
      if (delta > 2.5) {
        stepCountRef.current += 1;
        setSteps(savedSteps + stepCountRef.current);
      }
    }
    lastAccRef.current = magnitude;
  }, [savedSteps]);

  const startCounting = async () => {
    if (counting) {
      // Stop and save
      window.removeEventListener("devicemotion", handleMotion as EventListener);
      setCounting(false);
      const total = savedSteps + stepCountRef.current;
      setSavedSteps(total);
      setSteps(total);
      stepCountRef.current = 0;
      lastAccRef.current = null;
      await fetch("/api/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, steps: total }),
      });
      return;
    }

    // Request permission (iOS 13+)
    if (!permissionRef.current && typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function") {
      const req = (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission;
      const perm = await req();
      if (perm !== "granted") return;
      permissionRef.current = true;
    }

    stepCountRef.current = 0;
    lastAccRef.current = null;
    window.addEventListener("devicemotion", handleMotion as EventListener);
    setCounting(true);
  };

  // Stop counting when navigating away
  useEffect(() => {
    return () => {
      if (counting) window.removeEventListener("devicemotion", handleMotion as EventListener);
    };
  }, [counting, handleMotion]);

  const saveWorkout = async () => {
    setSaving(true);
    await fetch("/api/workout-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, notes, exercises }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addExercise = () => {
    const name = newExName.trim();
    if (!name) return;
    setExercises(prev => [...prev, { id: cuid(), name, sets: [{ reps: 10, weight: 0 }] }]);
    setNewExName("");
    setAddingEx(false);
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
      e.id === id ? { ...e, sets: e.sets.filter((_, i) => i !== si) } : e
    ));

  const updateSet = (id: string, si: number, field: keyof Set, val: number) =>
    setExercises(prev => prev.map(e =>
      e.id === id ? { ...e, sets: e.sets.map((s, i) => i === si ? { ...s, [field]: val } : s) } : e
    ));

  const isToday = date === today();

  return (
    <div className="app-main anim-page">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Dumbbell size={22} style={{ color: "var(--lavender)" }} />
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Entrenamiento</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button className="btn-ghost" onClick={() => setDate(d => addDays(d, -1))}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, minWidth: "90px", textAlign: "center" }}>
            {isToday ? "Hoy" : fmt(date)}
          </span>
          <button className="btn-ghost" onClick={() => setDate(d => addDays(d, 1))} disabled={isToday}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", maxWidth: "680px" }}>

        {/* Step counter */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Footprints size={18} style={{ color: "var(--mint)" }} />
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Contador de pasos</span>
            </div>
            <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--mint)", letterSpacing: "-0.03em" }}>
              {steps.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={startCounting}
              className="btn-primary"
              style={{
                flex: 1,
                padding: "10px",
                background: counting ? "var(--danger)" : "var(--mint)",
              }}
            >
              {counting ? "Detener conteo" : "Iniciar conteo"}
            </button>
            {steps > 0 && !counting && (
              <button
                className="btn-ghost"
                style={{ border: "1.5px solid var(--border)", padding: "9px 14px", fontSize: "0.82rem", color: "var(--text-muted)" }}
                onClick={async () => {
                  setSavedSteps(0);
                  setSteps(0);
                  await fetch("/api/steps", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date, steps: 0 }),
                  });
                }}
              >
                Resetear
              </button>
            )}
          </div>
          {counting && (
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "8px", textAlign: "center" }}>
              Contando... llevá el celular en el bolsillo o la mano
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="card" style={{ padding: "20px" }}>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "10px" }}>Notas del entrenamiento</p>
          <textarea
            className="input-base"
            placeholder="Ej: día de piernas, me sentí con energía..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            style={{ resize: "vertical", minHeight: "72px" }}
          />
        </div>

        {/* Exercises */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Ejercicios</p>
            <button
              className="btn-ghost"
              style={{ border: "1.5px solid var(--border)", padding: "6px 12px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "5px" }}
              onClick={() => setAddingEx(true)}
            >
              <Plus size={14} /> Agregar
            </button>
          </div>

          {addingEx && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                className="input-base"
                placeholder="Nombre del ejercicio"
                value={newExName}
                onChange={e => setNewExName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addExercise(); if (e.key === "Escape") setAddingEx(false); }}
                style={{ flex: 1, minWidth: 0, width: "auto" }}
                autoFocus
              />
              <button className="btn-primary" style={{ padding: "10px 14px", flexShrink: 0 }} onClick={addExercise}>
                <Plus size={15} />
              </button>
              <button className="btn-ghost" style={{ flexShrink: 0 }} onClick={() => { setAddingEx(false); setNewExName(""); }}>
                <X size={15} />
              </button>
            </div>
          )}

          {exercises.length === 0 && !addingEx && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
              Sin ejercicios. Agregá uno para empezar.
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {exercises.map((ex) => (
              <div key={ex.id} style={{ borderRadius: "0.875rem", border: "1.5px solid var(--border)", padding: "14px" }}>
                {/* Exercise header */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <input
                    className="input-base"
                    value={ex.name}
                    onChange={e => updateExName(ex.id, e.target.value)}
                    style={{ fontWeight: 700, fontSize: "0.92rem", flex: 1, minWidth: 0 }}
                  />
                  <button className="btn-ghost" onClick={() => removeExercise(ex.id)} style={{ color: "var(--danger)" }}>
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Sets header */}
                <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 32px", gap: "6px", marginBottom: "6px", paddingLeft: "2px" }}>
                  <span className="label" style={{ textAlign: "center" }}>#</span>
                  <span className="label" style={{ textAlign: "center" }}>KG</span>
                  <span className="label" style={{ textAlign: "center" }}>REPS</span>
                  <span />
                </div>

                {/* Sets rows */}
                {ex.sets.map((s, si) => (
                  <div key={si} style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 32px", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
                    <span style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>{si + 1}</span>
                    <input
                      className="input-base"
                      type="number"
                      min={0}
                      step={0.5}
                      value={s.weight}
                      onChange={e => updateSet(ex.id, si, "weight", parseFloat(e.target.value) || 0)}
                      style={{ textAlign: "center", padding: "8px 6px" }}
                    />
                    <input
                      className="input-base"
                      type="number"
                      min={1}
                      value={s.reps}
                      onChange={e => updateSet(ex.id, si, "reps", parseInt(e.target.value) || 0)}
                      style={{ textAlign: "center", padding: "8px 6px" }}
                    />
                    <button className="btn-ghost set-row-btn" onClick={() => removeSet(ex.id, si)} style={{ padding: "6px", color: "var(--text-muted)" }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}

                <button
                  className="btn-ghost"
                  style={{ marginTop: "4px", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}
                  onClick={() => addSet(ex.id)}
                >
                  <Plus size={13} /> Serie
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          className="btn-primary"
          style={{ padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}
          onClick={saveWorkout}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar entrenamiento"}
        </button>
      </div>
    </div>
  );
}
