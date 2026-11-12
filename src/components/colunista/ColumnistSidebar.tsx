"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { APP_VERSION } from "@/lib/version";
import { NotificationBell } from "@/components/NotificationBell";
import { Monitor, LogOut, Menu } from "lucide-react";
import type { MenuLink } from "@/lib/menu-registry";

export function ColumnistSidebar({
  menu,
  logoUrl,
  pendingComments = 0,
  unreadAnnouncements = 0,
  unreadInstructions = 0,
  unreadMessages = 0,
}: {
  menu: MenuLink[];
  logoUrl?: string;
  pendingComments?: number;
  unreadAnnouncements?: number;
  unreadInstructions?: number;
  unreadMessages?: number;
}) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    // Logged before signOut() — once the session cookie clears, the log
    // endpoint's own auth check would see nobody logged in.
    await fetch("/api/auth/log-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
      keepalive: true,
    }).catch(() => {});
    const supabase = createClient();
    await supabase.auth.signOut();
    // Hard navigation instead of router.push: guarantees the browser sends a
    // fresh request through middleware with the now-cleared session cookie,
    // instead of racing a client-side transition against cookie clearing.
    window.location.href = "/admin/login";
  }

  return (
    <>
    <div className="admin-mobile-bar">
      <button type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menu" style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "0.25rem", display: "flex" }}>
        <Menu size={22} />
      </button>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="Festina" style={{ height: "1.4175rem", width: "auto" }} />
      ) : (
        <span style={{ fontWeight: 800, fontSize: "0.9375rem" }}>Festina</span>
      )}
    </div>
    {mobileOpen && <div className="admin-backdrop" onClick={() => setMobileOpen(false)} />}
    <aside
      className={mobileOpen ? "admin-sidebar admin-sidebar-open" : "admin-sidebar"}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) setMobileOpen(false);
      }}
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
          <>
            <span style={{ display: "block", fontSize: "0.5625rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.1875rem" }}>
              Grupo
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Festina" style={{ height: "1.8225rem", width: "auto", display: "block" }} />
          </>
        ) : (
          <div style={{ fontWeight: 800, fontSize: "1rem", background: "linear-gradient(135deg, #315E9C, #C89A4A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Festina
          </div>
        )}
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.375rem" }}>Painel do Colunista</div>
      </div>

      <nav className="admin-sidebar-scroll" style={{ padding: "1rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }}>
        {menu.map(({ href, label, icon }) => {
          const isActive = pathname === href || (href !== "/colunista" && pathname.startsWith(href));
          const badge =
            href === "/colunista/comentarios"
              ? pendingComments
              : href === "/colunista/comunicados"
                ? unreadAnnouncements
                : href === "/colunista/instrucoes"
                  ? unreadInstructions
                  : href === "/colunista/mensagens"
                    ? unreadMessages
                    : 0;
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
                backgroundColor: isActive ? "rgba(49, 94, 156,0.2)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              {icon}
              {label}
              {badge > 0 && (
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
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <NotificationBell />
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
      <style>{`
        .admin-mobile-bar { display: none; }
        .admin-backdrop { display: none; }
        @media (max-width: 900px) {
          .admin-mobile-bar {
            display: flex;
            align-items: center;
            gap: 0.875rem;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 3.5rem;
            padding: 0 1rem;
            background: #0d1b2a;
            color: white;
            z-index: 150;
          }
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 200;
            width: 260px !important;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .admin-sidebar.admin-sidebar-open { transform: none; }
          .admin-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            z-index: 190;
          }
        }
      `}</style>
    </aside>
    </>
  );
}
