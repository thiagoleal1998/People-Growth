"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { APP_VERSION } from "@/lib/version";
import { FileText, MessageCircle, UserCircle, Monitor, LogOut, LifeBuoy } from "lucide-react";

const links = [
  { href: "/autor", label: "Meus artigos", icon: FileText },
  { href: "/autor/comentarios", label: "Comentários", icon: MessageCircle },
  { href: "/autor/chamados", label: "Chamados", icon: LifeBuoy },
  { href: "/autor/perfil", label: "Meu perfil", icon: UserCircle },
];

export function AuthorSidebar({ logoUrl, pendingComments = 0 }: { logoUrl?: string; pendingComments?: number }) {
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
      <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="People & Growth" style={{ height: "2.25rem", width: "auto", display: "block" }} />
        ) : (
          <div style={{ fontWeight: 800, fontSize: "1rem", background: "linear-gradient(135deg, #4361EE, #06D6A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            People & Growth
          </div>
        )}
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.375rem" }}>Painel do Autor</div>
      </div>

      <nav className="admin-sidebar-scroll" style={{ padding: "1rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }}>
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/autor" && pathname.startsWith(href));
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
              {href === "/autor/comentarios" && pendingComments > 0 && (
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
                  {pendingComments > 99 ? "99+" : pendingComments}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
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
        <div style={{ padding: "0.5rem 0.875rem 0", fontSize: "0.6875rem", color: "rgba(255,255,255,0.25)" }}>v{APP_VERSION}</div>
      </div>
    </aside>
  );
}
