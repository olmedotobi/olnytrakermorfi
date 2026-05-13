"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("El enlace no es válido.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al restablecer la contraseña"); }
      else { setDone(true); setTimeout(() => router.push("/login"), 2500); }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "32px" }}>
      {done ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✅</div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "10px", color: "var(--text)" }}>
            Contraseña actualizada
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
            Nueva contraseña
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "24px" }}>
            Ingresá tu nueva contraseña.
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className="label">NUEVA CONTRASEÑA</span>
              <input
                className="input-base"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className="label">CONFIRMAR CONTRASEÑA</span>
              <input
                className="input-base"
                type="password"
                placeholder="Repetí la contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={6}
              />
            </label>
            {error && (
              <p style={{ fontSize: "0.85rem", textAlign: "center", padding: "8px 12px", borderRadius: "0.75rem", background: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={loading || !token} style={{ padding: "12px", marginTop: "4px" }}>
              {loading ? "Guardando..." : "Guardar contraseña"}
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
  );
}

export default function ResetPasswordPage() {
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
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
