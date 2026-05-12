"use client";

interface Props {
  protein: { consumed: number; goal: number };
  carbs:   { consumed: number; goal: number };
  fat:     { consumed: number; goal: number };
}

function Bar({ label, consumed, goal, color }: { label: string; consumed: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ width: "112px", flexShrink: 0, fontSize: "0.88rem", color: "var(--text)" }}>{label}</span>
      <div style={{ flex: 1, height: "4px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "999px", background: color, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", width: "76px", textAlign: "right", flexShrink: 0 }}>
        {Math.round(consumed)}g / {goal}g
      </span>
    </div>
  );
}

export default function MacroBars({ protein, carbs, fat }: Props) {
  return (
    <div>
      <p className="label" style={{ marginBottom: "4px" }}>MACRONUTRIENTES</p>
      <p style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "18px", marginTop: "4px", color: "var(--text)" }}>
        Tu día en proteína, carbos y grasas
      </p>
      <Bar label="Proteína"      consumed={protein.consumed} goal={protein.goal} color="var(--protein)" />
      <Bar label="Carbohidratos" consumed={carbs.consumed}   goal={carbs.goal}   color="var(--carbs)" />
      <Bar label="Grasas"        consumed={fat.consumed}     goal={fat.goal}     color="var(--fat)" />
    </div>
  );
}
