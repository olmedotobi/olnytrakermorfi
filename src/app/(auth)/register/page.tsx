"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const { error } = await res.json(); setError(error || "Error al crear la cuenta"); setLoading(false); return; }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/profile?setup=1");
  };

  const FIELDS = [
    { key: "name",     label: "NOMBRE",     type: "text",     placeholder: "Juan García" },
    { key: "email",    label: "EMAIL",      type: "email",    placeholder: "tu@email.com" },
    { key: "password", label: "CONTRASEÑA", type: "password", placeholder: "Mínimo 6 caracteres" },
  ];

  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <img src="/icon.svg" alt="logo" style={{ width: 64, height: 64, borderRadius: "16px", marginBottom: "14px" }} />
        <p style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--text)" }}>
          Onlytracker <span className="serif-italic" style={{ fontWeight: 400 }}>Morfi</span>
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "6px" }}>
          tu tracker nutricional
        </p>
      </div>

      <div className="card" style={{ padding: "32px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px", color: "var(--text)" }}>Crear cuenta</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {FIELDS.map(field => (
            <label key={field.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className="label">{field.label}</span>
              <input className="input-base" type={field.type} placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                required minLength={field.key === "password" ? 6 : undefined} />
            </label>
          ))}
          {error && (
            <p style={{ fontSize: "0.85rem", textAlign: "center", padding: "8px 12px", borderRadius: "0.75rem", background: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "12px", marginTop: "4px" }}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "20px" }}>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" style={{ color: "var(--salmon)", fontWeight: 700, textDecoration: "none" }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
