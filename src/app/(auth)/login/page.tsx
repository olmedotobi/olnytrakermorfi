"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Email o contraseña incorrectos");
    else router.push("/dashboard");
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <p className="gradient-text" style={{ fontSize: "2.4rem", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
          OnlyTracker
        </p>
        <p className="serif-italic" style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: "4px" }}>
          tu tracker nutricional
        </p>
      </div>

      <div className="card" style={{ padding: "32px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px", color: "var(--text)" }}>Iniciar sesión</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span className="label">EMAIL</span>
            <input className="input-base" type="email" placeholder="tu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span className="label">CONTRASEÑA</span>
            <input className="input-base" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {error && (
            <p style={{ fontSize: "0.85rem", textAlign: "center", padding: "8px 12px", borderRadius: "0.75rem", background: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "12px", marginTop: "4px" }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "20px" }}>
          ¿No tenés cuenta?{" "}
          <Link href="/register" style={{ color: "var(--salmon)", fontWeight: 700, textDecoration: "none" }}>
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
