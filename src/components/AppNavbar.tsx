"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, CalendarDays, User, LogOut, Dumbbell } from "lucide-react";
import ThemePicker from "@/components/ThemePicker";

const NAV = [
  { href: "/dashboard", label: "Inicio",      icon: Home },
  { href: "/foods",     label: "Alimentos",   icon: UtensilsCrossed },
  { href: "/calendar",  label: "Calendario",  icon: CalendarDays },
  { href: "/training",  label: "Entreno",     icon: Dumbbell },
  { href: "/profile",   label: "Perfil",      icon: User },
];

export default function AppNavbar({ userName }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar — desktop full nav, mobile solo logo + controles */}
      <nav className="app-topbar">
        <div className="app-topbar-inner">
          <Link href="/dashboard" className="app-logo">
            <img src="/icon.svg" alt="logo" style={{ width: 30, height: 30, borderRadius: "8px", flexShrink: 0 }} />
            <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>Onlytracker</span>
            <span className="serif-italic" style={{ fontSize: "1.05rem", color: "var(--text-muted)" }}>Morfi</span>
          </Link>

          {/* Links solo en desktop */}
          <div className="app-topbar-links">
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
            {userName && (
              <span className="app-topbar-username">{userName.split(" ")[0]}</span>
            )}
            <ThemePicker />
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="app-topbar-salir">
              <LogOut size={15} />
              <span className="app-topbar-salir-label">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom nav — solo mobile */}
      <nav className="app-bottomnav">
        {NAV.map(n => {
          const Icon = n.icon;
          const active = pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={`app-bottomnav-item${active ? " active" : ""}`}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
