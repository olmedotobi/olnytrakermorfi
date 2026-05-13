"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isElectron, setIsElectron] = useState(true);

  useEffect(() => {
    setIsElectron(/electron/i.test(navigator.userAgent));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) setError("Email o contraseña incorrectos");
      else router.push("/dashboard");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

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
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px", color: "var(--text)" }}>Iniciar sesión</h2>

        {!isElectron && (
          <>
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: "10px", padding: "11px 16px", borderRadius: "0.875rem",
                border: "1.5px solid var(--border)", background: "var(--bg-card)",
                cursor: "pointer", fontSize: "0.9rem", fontWeight: 600,
                color: "var(--text)", fontFamily: "var(--font-outfit, sans-serif)",
                transition: "background 0.12s", opacity: googleLoading ? 0.6 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? "Redirigiendo..." : "Continuar con Google"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>o con email</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>
          </>
        )}

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
