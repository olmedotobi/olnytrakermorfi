"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";

const MOODS = [
  { id: "motivated", emoji: "💪", label: "motivado" },
  { id: "happy",     emoji: "😊", label: "feliz" },
  { id: "relaxed",   emoji: "😌", label: "relajado" },
  { id: "tired",     emoji: "😴", label: "cansado" },
  { id: "focused",   emoji: "🎯", label: "enfocado" },
  { id: "sad",       emoji: "😔", label: "triste" },
] as const;

type MoodId = (typeof MOODS)[number]["id"];

const WI: Record<number, string> = { 0:"☀️",1:"🌤️",2:"⛅",3:"☁️",51:"🌦️",61:"🌧️",71:"❄️",95:"⛈️" };
const WD: Record<number, string> = { 0:"despejado",1:"mayormente despejado",2:"parcialmente nublado",3:"nublado",51:"llovizna",61:"lluvia",71:"nevada",95:"tormenta" };

export default function WeatherMotivation() {
  const todayKey = `mood-${format(new Date(), "yyyy-MM-dd")}`;
  const [mood, setMood] = useState<MoodId>("motivated");
  const [weather, setWeather] = useState<{ temp: string; desc: string; icon: string; city: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(todayKey) as MoodId | null;
    if (saved && MOODS.find(m => m.id === saved)) setMood(saved);
  }, [todayKey]);

  useEffect(() => {
    const fetchW = (lat: number, lon: number, city: string) =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`)
        .then(r => r.json()).then(d => {
          const code = d.current?.weather_code ?? 0;
          setWeather({ temp: Math.round(d.current?.temperature_2m ?? 0) + "°C", desc: WD[code] ?? "variable", icon: WI[code] ?? "🌤️", city });
        }).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => fetchW(p.coords.latitude, p.coords.longitude, "Tu ubicación"),
        () => fetchW(-34.6, -58.4, "Buenos Aires"),
        { timeout: 5000 }
      );
    } else fetchW(-34.6, -58.4, "Buenos Aires");
  }, []);

  const handleMood = (m: MoodId) => { setMood(m); localStorage.setItem(todayKey, m); };

  return (
    <div>
      <p className="label" style={{ marginBottom: "10px" }}>CLIMA</p>
      {weather ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p style={{ fontSize: "1.9rem", fontWeight: 900, lineHeight: 1, color: "var(--text)" }}>{weather.temp}</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>{weather.desc} · {weather.city}</p>
          </div>
          <div style={{ fontSize: "2.2rem", background: "var(--bg-input)", borderRadius: "1rem", padding: "8px 12px", lineHeight: 1 }}>
            {weather.icon}
          </div>
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>Cargando clima...</p>
      )}

      <p className="label" style={{ marginBottom: "10px" }}>¿CÓMO TE SENTÍS HOY?</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {MOODS.map(m => (
          <button key={m.id} onClick={() => handleMood(m.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
            padding: "10px 6px",
            borderRadius: "1rem",
            border: "none",
            background: mood === m.id ? "var(--text)" : "var(--bg-input)",
            cursor: "pointer",
            transition: "background 0.15s",
            fontFamily: "var(--font-outfit, sans-serif)",
          }}>
            <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{m.emoji}</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: mood === m.id ? "var(--bg-card)" : "var(--text-muted)" }}>
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
