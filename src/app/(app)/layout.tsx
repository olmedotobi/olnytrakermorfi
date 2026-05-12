import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <AppNavbar userName={session.user.name ?? undefined} />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
