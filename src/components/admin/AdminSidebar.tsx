"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./ThemeToggle";
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
  UserCircle,
  Search,
  KeyRound,
  MessageCircle,
  ScrollText,
  Eye,
  Megaphone,
  BarChart3,
  LifeBuoy,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/artigos", label: "Artigos", icon: FileText },
  { href: "/admin/comentarios", label: "Comentários", icon: MessageCircle, countKey: "comentarios" as const },
  { href: "/admin/autores", label: "Autores", icon: UserCircle },
  { href: "/admin/portfolio", label: "Portfólio", icon: Briefcase },
  { href: "/admin/servicos", label: "Serviços", icon: Wrench },
  { href: "/admin/leads", label: "Leads / CRM", icon: Users, countKey: "leads" as const },
  { href: "/admin/chamados", label: "Chamados", icon: LifeBuoy, countKey: "chamados" as const },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquare },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/recursos", label: "Recursos", icon: Download },
  { href: "/admin/midia", label: "Na Mídia", icon: Monitor },
  { href: "/admin/publicidade", label: "Publicidade", icon: Megaphone },
  { href: "/admin/seo", label: "SEO, GEO & AEO", icon: Search },
  { href: "/admin/usuarios", label: "Usuários", icon: KeyRound },
  { href: "/admin/paginas", label: "Páginas Institucionais", icon: ScrollText },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar({
  logoUrl,
  userName,
  userPhoto,
  counts,
}: {
  logoUrl?: string;
  userName?: string;
  userPhoto?: string;
  counts?: { comentarios: number; leads: number; chamados: number };
}) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // Hard navigation instead of router.push: guarantees the browser sends a
    // fresh request through middleware with the now-cleared session cookie,
    // instead of racing a client-side transition against cookie clearing.
    window.location.href = "/admin/login";
  }

  return (
    <aside
      style={{
        width: "240px",
        height: "100%",
        backgroundColor: "#0d1b2a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="People & Growth" style={{ height: "2.25rem", width: "auto", display: "block" }} />
        ) : (
          <div style={{ fontWeight: 800, fontSize: "1rem", background: "linear-gradient(135deg, #4361EE, #06D6A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            People & Growth
          </div>
        )}
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.375rem" }}>Painel Admin</div>
      </div>

      {/* Nav */}
      <nav className="admin-sidebar-scroll" style={{ padding: "1rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }}>
        {links.map(({ href, label, icon: Icon, countKey }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          const count = countKey ? counts?.[countKey] ?? 0 : 0;
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
              {count > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    backgroundColor: "#dc2626",
                    color: "white",
                    fontSize: "0.6875rem",
                    fontWeight: 800,
                    minWidth: "1.25rem",
                    height: "1.25rem",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 0.3rem",
                    flexShrink: 0,
                  }}
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logged-in user */}
      {userName && (
        <div style={{ padding: "0.875rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "50%",
              flexShrink: 0,
              background: userPhoto ? `url(${userPhoto}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
            }}
          />
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userName}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <ThemeToggle />
        <Link
          href="/autor"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
        >
          <Eye size={17} /> Ver painel do colaborador
        </Link>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
        >
          <Monitor size={17} /> Ver site
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: loggingOut ? "default" : "pointer", width: "100%", opacity: loggingOut ? 0.6 : 1 }}
        >
          <LogOut size={17} className={loggingOut ? "admin-spin" : undefined} /> {loggingOut ? "Saindo..." : "Sair"}
        </button>
      </div>
    </aside>
  );
}
