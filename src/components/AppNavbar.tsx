"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemePicker from "@/components/ThemePicker";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/foods",     label: "Alimentos" },
  { href: "/calendar",  label: "Calendario" },
  { href: "/profile",   label: "Perfil" },
];

export default function AppNavbar({ userName }: { userName?: string }) {
  const pathname = usePathname();
  return (
    <nav style={{ background: "var(--bg-card)", borderBottom: "1.5px solid var(--border)", position: "sticky", top: 0, zIndex: 100, transition: "background 0.2s ease, border-color 0.2s ease" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "5px" }}>
          <span className="gradient-text" style={{ fontSize: "1.15rem", fontWeight: 900, letterSpacing: "-0.02em" }}>OnlyTracker</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>Morfi</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} style={{
              padding: "6px 14px", borderRadius: "0.75rem", textDecoration: "none",
              fontSize: "0.875rem", fontWeight: pathname.startsWith(n.href) ? 700 : 500,
              color: pathname.startsWith(n.href) ? "var(--text)" : "var(--text-muted)",
              background: pathname.startsWith(n.href) ? "var(--bg-input)" : "transparent",
              transition: "background 0.12s",
            }}>
              {n.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {userName && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>{userName.split(" ")[0]}</span>}
          <ThemePicker />
          <button onClick={() => signOut({ callbackUrl: "/login" })} style={{
            padding: "6px 14px", borderRadius: "0.75rem", border: "1.5px solid var(--border)",
            background: "none", cursor: "pointer", fontSize: "0.82rem", color: "var(--text-muted)",
            fontFamily: "var(--font-outfit, sans-serif)", fontWeight: 500,
          }}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
