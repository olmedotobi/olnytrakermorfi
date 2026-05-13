"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al enviar el email");
      } else {
        setSent(true);
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <img src="/icon.svg" alt="logo" style={{ width: 92, height: 92, borderRadius: "22px", display: "block", margin: "0 auto 18px" }} />
        <p style={{ fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--text)" }}>
          Onlytracker <span className="serif-italic" style={{ fontWeight: 400 }}>Morfi</span>
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "7px" }}>
          tu tracker nutricional
        </p>
      </div>

      <div className="card auth-card" style={{ padding: "32px" }}>
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📬</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "10px", color: "var(--text)" }}>
              Email enviado
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "24px" }}>
              Si existe una cuenta con ese email, vas a recibir un enlace para restablecer tu contraseña. Revisá también la carpeta de spam.
            </p>
            <Link href="/login" style={{ color: "var(--salmon)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
              Olvidé mi contraseña
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.5 }}>
              Ingresá tu email y te enviamos un enlace para crear una nueva contraseña.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="label">EMAIL</span>
                <input
                  className="input-base"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </label>
              {error && (
                <p style={{ fontSize: "0.85rem", textAlign: "center", padding: "8px 12px", borderRadius: "0.75rem", background: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "12px", marginTop: "4px" }}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "20px" }}>
              <Link href="/login" style={{ color: "var(--salmon)", fontWeight: 700, textDecoration: "none" }}>
                Volver al inicio de sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
