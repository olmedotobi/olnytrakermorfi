"use client";

import { useEffect, useState, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, subMonths, addMonths, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { calculateBMR, calculateTDEE, type ActivityLevel } from "@/lib/calc";

type DayData = { calories: number; protein: number; carbs: number; fat: number };
type FoodEntry = { id: string; foodName: string; grams: number; calories: number; mealType: string };
type WeightEntry = { date: string; weight: number };

function WeeklyChart({ data }: { data: number[] }) {
  if (data.every(v => v === 0)) return (
    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>Sin datos esta semana</p>
  );
  const maxVal = Math.max(...data, 100);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * 220, y: 60 - (v / maxVal) * 54 }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `M 0 60 ${pts.map(p => `L ${p.x} ${p.y}`).join(" ")} L 220 60 Z`;
  return (
    <svg viewBox="0 0 220 64" style={{ width: "100%", height: "64px" }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--text)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--text)" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#cg)" />
      <path d={line} fill="none" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="var(--text)" />)}
    </svg>
  );
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, DayData>>({});
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayEntries, setDayEntries] = useState<FoodEntry[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteIndicators, setNoteIndicators] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(p => {
      if (p) setCalorieGoal(calculateTDEE(calculateBMR(p.weight, p.height, p.age, p.gender), p.activityLevel as ActivityLevel));
    });
    fetch("/api/weight-entries").then(r => r.json()).then(setWeightData);
  }, []);

  useEffect(() => {
    const month = format(currentMonth, "yyyy-MM");
    fetch(`/api/calendar?month=${month}`).then(r => r.json()).then(setCalendarData);
  }, [currentMonth]);

  const loadDay = useCallback(async (date: string) => {
    setSelectedDay(date);
    setNote("");
    setNoteSaved(false);
    const [entries, noteRes] = await Promise.all([
      fetch(`/api/food-entries?date=${date}`).then(r => r.json()),
      fetch(`/api/day-notes?date=${date}`).then(r => r.json()),
    ]);
    setDayEntries(entries);
    const noteText = noteRes.note ?? "";
    setNote(noteText);
    setNoteIndicators(prev => { const s = new Set(prev); noteText.trim() ? s.add(date) : s.delete(date); return s; });
  }, []);

  const saveNote = async () => {
    if (!selectedDay) return;
    setNoteSaving(true);
    await fetch("/api/day-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: selectedDay, note }) });
    setNoteSaving(false);
    setNoteSaved(true);
    setNoteIndicators(prev => { const s = new Set(prev); note.trim() ? s.add(selectedDay) : s.delete(selectedDay); return s; });
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const weekDays = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

  const getPct = (dateStr: string) => {
    const d = calendarData[dateStr];
    if (!d || d.calories <= 0) return null;
    return Math.round((d.calories / calorieGoal) * 100);
  };

  const getAccent = (pct: number | null) => {
    if (pct === null) return { bg: "transparent", dot: "transparent", text: "var(--text-muted)", border: "var(--border)" };
    if (pct < 80)  return { bg: "var(--sky-bg)",      dot: "var(--sky)",      text: "var(--sky)",      border: "transparent" };
    if (pct < 105) return { bg: "var(--mint-bg)",     dot: "var(--mint)",     text: "var(--mint)",     border: "transparent" };
    if (pct < 120) return { bg: "var(--carbs-bg)",    dot: "var(--warning)",  text: "var(--warning)",  border: "transparent" };
    return               { bg: "rgba(239,68,68,0.1)", dot: "var(--danger)",   text: "var(--danger)",   border: "transparent" };
  };

  const selectedDayData = selectedDay ? calendarData[selectedDay] : null;
  const selectedPct = selectedDay ? getPct(selectedDay) : null;
  const selectedAccent = getAccent(selectedPct);

  const weeklyData = selectedDay
    ? Array.from({ length: 7 }, (_, i) => {
        const d = format(subDays(new Date(selectedDay + "T00:00:00"), 6 - i), "yyyy-MM-dd");
        const data = calendarData[d];
        return data ? Math.round((data.calories / calorieGoal) * 100) : 0;
      })
    : [];

  void weightData;
  void dayEntries;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <p className="label" style={{ marginBottom: "4px" }}>TU HISTORIAL</p>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "4px" }}>
            Calendario de <span className="serif-italic">progreso</span>
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Tocá cualquier día para ver el detalle ✨
          </p>
        </div>
        <div className="cal-legend" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {[
            { dot: "var(--sky)",     label: "bajo objetivo (<80%)" },
            { dot: "var(--mint)",    label: "en meta (80-105%)" },
            { dot: "var(--warning)", label: "cerca del límite" },
            { dot: "var(--danger)",  label: "sobre el límite" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: l.dot, flexShrink: 0 }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="cal-grid">

        {/* Calendar grid */}
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <button className="btn-ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{ fontSize: "1.1rem" }}>◀</button>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, textTransform: "capitalize" }}>
              {format(currentMonth, "MMMM", { locale: es }).charAt(0).toUpperCase()}{format(currentMonth, "MMMM", { locale: es }).slice(1)} {format(currentMonth, "yyyy")}
            </h2>
            <button className="btn-ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ fontSize: "1.1rem" }}>▶</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" }}>
            {weekDays.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.04em", color: "var(--text-muted)", padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
            {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isSelected = selectedDay === dateStr;
              const todayDay = isToday(day);
              const pct = getPct(dateStr);
              const accent = getAccent(pct);
              const hasNote = noteIndicators.has(dateStr);

              return (
                <button key={dateStr} onClick={() => loadDay(dateStr)}
                  className="cal-day-btn"
                  style={{
                    border: isSelected ? "2px solid var(--text)" : todayDay ? "2px solid var(--text)" : "2px solid transparent",
                    background: isSelected ? "var(--text)" : pct !== null ? accent.bg : "transparent",
                  }}>
                  {hasNote && <span style={{ position: "absolute", top: "2px", right: "2px", fontSize: "7px" }}>📝</span>}
                  <span className="cal-day-num" style={{ color: isSelected ? "var(--bg-card)" : "var(--text)" }}>
                    {day.getDate()}
                  </span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
                    {pct !== null && (
                      <span className="cal-day-pct" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : accent.text }}>
                        {pct}%
                      </span>
                    )}
                    {pct !== null && (
                      <div className="cal-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.5)" : accent.dot, flexShrink: 0 }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {selectedDay ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p className="label">
                  {format(currentMonth, "MMMM yyyy", { locale: es }).toUpperCase()} · DÍA {new Date(selectedDay + "T00:00:00").getDate()}
                </p>
                <button className="btn-ghost" onClick={() => setSelectedDay(null)} style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>✕</button>
              </div>

              {selectedDayData ? (
                <>
                  <div>
                    <p style={{ fontSize: "2.5rem", fontWeight: 900, lineHeight: 1, color: "var(--text)" }}>
                      {Math.round(selectedDayData.calories).toLocaleString()}
                      <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: "6px" }}>kcal</span>
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>{selectedPct}% de tu objetivo diario</p>
                    <div style={{ marginTop: "10px", height: "5px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                      <div style={{ width: `${Math.min((selectedDayData.calories / calorieGoal) * 100, 100)}%`, height: "100%", borderRadius: "999px", background: selectedAccent.dot !== "transparent" ? selectedAccent.dot : "var(--text)", transition: "width 0.5s ease" }} />
                    </div>
                  </div>

                  <div>
                    <p className="label" style={{ marginBottom: "10px" }}>MACROS DEL DÍA</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                      {[
                        { label: "PROT",  value: selectedDayData.protein },
                        { label: "CARB",  value: selectedDayData.carbs },
                        { label: "GRASA", value: selectedDayData.fat },
                      ].map(m => (
                        <div key={m.label} className="card" style={{ padding: "10px", textAlign: "center", borderRadius: "0.875rem" }}>
                          <p className="label" style={{ fontSize: "0.55rem", marginBottom: "4px" }}>{m.label}</p>
                          <p style={{ fontSize: "1.2rem", fontWeight: 800, lineHeight: 1, color: "var(--text)" }}>
                            {Math.round(m.value)}<span style={{ fontSize: "0.68rem", fontWeight: 400, color: "var(--text-muted)" }}>g</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="label" style={{ marginBottom: "8px" }}>RESUMEN SEMANAL</p>
                    <WeeklyChart data={weeklyData} />
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>últimos 7 días · porcentaje del objetivo</p>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
                  <p style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📭</p>
                  <p style={{ fontSize: "0.9rem" }}>Sin registros nutricionales</p>
                </div>
              )}

              <div style={{ marginTop: "auto", borderTop: "1.5px solid var(--border)", paddingTop: "16px" }}>
                <p className="label" style={{ marginBottom: "8px" }}>📝 NOTA DEL DÍA</p>
                <textarea className="input-base" rows={3}
                  style={{ resize: "none", borderRadius: "1rem", marginBottom: "8px" }}
                  placeholder="¿Cómo te sentiste hoy? ¿Algo especial..."
                  value={note}
                  onChange={e => { setNote(e.target.value); setNoteSaved(false); }} />
                <button className="btn-primary" onClick={saveNote} disabled={noteSaving} style={{ width: "100%", padding: "10px" }}>
                  {noteSaved ? "✓ Guardado" : noteSaving ? "Guardando..." : "Guardar nota"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
              <p style={{ fontSize: "3rem", marginBottom: "10px" }}>📅</p>
              <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Seleccioná un día</p>
              <p style={{ fontSize: "0.88rem" }}>Tocá cualquier día para ver su detalle y agregar notas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
