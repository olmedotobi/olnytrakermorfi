"use client";
import { useState, useRef, useEffect } from "react";
import { PALETTES } from "@/lib/themes";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { palette, mode, setPalette, toggleMode } = useTheme();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} title="Cambiar tema" style={{
        fontSize: "1.1rem", background: open ? "var(--bg-input)" : "none",
        border: "1.5px solid var(--border)", borderRadius: "0.75rem",
        padding: "5px 10px", cursor: "pointer", lineHeight: 1,
        transition: "background 0.12s",
      }}>
        🎨
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          background: "var(--bg-card)", border: "1.5px solid var(--border)",
          borderRadius: "1.25rem", padding: "18px", width: "300px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)", zIndex: 300,
        }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
            {(["light", "dark"] as const).map(m => (
              <button key={m} onClick={() => mode !== m && toggleMode()} style={{
                flex: 1, padding: "8px 0", borderRadius: "0.75rem",
                border: "1.5px solid var(--border)",
                background: mode === m ? "var(--text)" : "var(--bg-input)",
                color: mode === m ? "var(--bg-card)" : "var(--text-muted)",
                cursor: "pointer", fontFamily: "var(--font-outfit, sans-serif)",
                fontWeight: 600, fontSize: "0.82rem", transition: "all 0.15s",
              }}>
                {m === "light" ? "☀️ Claro" : "🌙 Oscuro"}
              </button>
            ))}
          </div>

          {/* Palette grid */}
          <p className="label" style={{ marginBottom: "10px" }}>PALETA</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
            {PALETTES.map(p => {
              const isActive = palette === p.id;
              return (
                <button key={p.id} onClick={() => { setPalette(p.id); }} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                  padding: "10px 4px", borderRadius: "0.875rem", cursor: "pointer",
                  border: isActive ? "2px solid var(--text)" : "1.5px solid var(--border)",
                  background: isActive ? "var(--bg-input)" : "transparent",
                  fontFamily: "var(--font-outfit, sans-serif)",
                  transition: "border-color 0.12s, background 0.12s",
                }}>
                  <div style={{ display: "flex", gap: "3px" }}>
                    {p.swatches.map((color, i) => (
                      <div key={i} style={{ width: "11px", height: "11px", borderRadius: "50%", background: color, flexShrink: 0, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)", lineHeight: 1 }}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
