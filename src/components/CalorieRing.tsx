"use client";

interface Props { consumed: number; goal: number; }

export default function CalorieRing({ consumed, goal }: Props) {
  const r = 76;
  const circ = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const dashoffset = circ * (1 - pct);
  const remaining = Math.max(goal - consumed, 0);

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="190" height="190" viewBox="0 0 190 190" style={{ display: "block", margin: "0 auto" }}>
        <circle cx="95" cy="95" r={r} fill="none" stroke="var(--border)" strokeWidth="13" />
        <circle cx="95" cy="95" r={r} fill="none" stroke="var(--text)" strokeWidth="13"
          strokeDasharray={circ}
          strokeDashoffset={pct === 0 ? circ : dashoffset}
          strokeLinecap="round"
          transform="rotate(-90 95 95)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="95" y="87" textAnchor="middle"
          style={{ fontSize: "32px", fontWeight: 900, fill: "var(--text)", fontFamily: "var(--font-outfit, system-ui)" }}>
          {consumed}
        </text>
        <text x="95" y="108" textAnchor="middle"
          style={{ fontSize: "9px", fontWeight: 700, fill: "var(--text-muted)", fontFamily: "var(--font-outfit, system-ui)", letterSpacing: "0.1em" }}>
          KCAL · HOY
        </text>
      </svg>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
        {remaining} kcal restantes de {goal}
      </p>
    </div>
  );
}
