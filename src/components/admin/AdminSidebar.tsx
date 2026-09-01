"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Settings,
  Users,
  Mail,
  BookOpen,
  Download,
  Monitor,
  MessageSquare,
  LogOut,
  Wrench,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/artigos", label: "Artigos", icon: FileText },
  { href: "/admin/portfolio", label: "Portfólio", icon: Briefcase },
  { href: "/admin/servicos", label: "Serviços", icon: Wrench },
  { href: "/admin/leads", label: "Leads / CRM", icon: Users },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquare },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/recursos", label: "Recursos", icon: Download },
  { href: "/admin/midia", label: "Na Mídia", icon: Monitor },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        backgroundColor: "#0d1b2a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontWeight: 800, fontSize: "1rem", background: "linear-gradient(135deg, #4361EE, #06D6A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          People & Growth
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.125rem" }}>Painel Admin</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "1rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.875rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: isActive ? "white" : "rgba(255,255,255,0.55)",
                backgroundColor: isActive ? "rgba(67,97,238,0.2)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
        >
          <Monitor size={17} /> Ver site
        </Link>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", width: "100%" }}
        >
          <LogOut size={17} /> Sair
        </button>
      </div>
    </aside>
  );
}
