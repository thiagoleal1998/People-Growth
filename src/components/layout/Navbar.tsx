"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

// Flat top-level items, kept short on purpose — everything else lives inside
// one of the two dropdown groups below so the bar doesn't run out of room.
const navLinks = [
  { key: "home", href: "/" as const },
  { key: "about", href: "/sobre" as const },
  { key: "newsletter", href: "/conteudo" as const },
  { key: "contact", href: "/contato" as const },
];

const navGroups = [
  {
    key: "brands",
    items: [
      { key: "peopleGrowth", href: "/people-growth" as const },
      { key: "pontoDeReplica", href: "/ponto-de-replica" as const },
      { key: "meaSententia", href: "/mea-sententia" as const },
    ],
  },
  {
    key: "consulting",
    items: [
      { key: "services", href: "/servicos" as const },
      { key: "portfolio", href: "/portfolio" as const },
      { key: "courses", href: "/cursos" as const },
      { key: "resources", href: "/recursos" as const },
      { key: "media", href: "/na-midia" as const },
    ],
  },
];

export function Navbar({
  logoUrl,
  mediaEnabled = true,
  portfolioEnabled = true,
  coursesEnabled = true,
}: {
  logoUrl?: string | null;
  mediaEnabled?: boolean;
  portfolioEnabled?: boolean;
  coursesEnabled?: boolean;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const visibleNavGroups = navGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((l) => (mediaEnabled || l.key !== "media") && (portfolioEnabled || l.key !== "portfolio") && (coursesEnabled || l.key !== "courses")),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <header
      className="site-navbar"
      style={{
        position: "fixed",
        top: "2.25rem",
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "rgba(13, 27, 42, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <nav className="container-xl" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.18rem" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.1875rem" }}>
          {logoUrl ? (
            <>
              <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Grupo
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Festina" style={{ height: "2.43rem", width: "auto" }} />
            </>
          ) : (
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.25rem",
                background: "linear-gradient(135deg, #315E9C, #C89A4A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              Festina
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="hidden-mobile">
          {navLinks.map(({ key, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={key}
                href={href}
                style={{
                  padding: "0.375rem 0.875rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: isActive ? "#315E9C" : "rgba(255,255,255,0.75)",
                  backgroundColor: isActive ? "rgba(49, 94, 156,0.12)" : "transparent",
                  transition: "all 0.2s",
                }}
              >
                {t(key as keyof typeof t)}
              </Link>
            );
          })}
          {visibleNavGroups.map((group) => {
            const groupActive = group.items.some((l) => pathname === l.href || pathname.startsWith(l.href + "/"));
            return (
              <div
                key={group.key}
                className="nav-dropdown"
                onMouseEnter={() => setOpenGroup(group.key)}
                onMouseLeave={() => setOpenGroup((g) => (g === group.key ? null : g))}
                style={{ position: "relative" }}
              >
                <button
                  type="button"
                  onClick={() => setOpenGroup((g) => (g === group.key ? null : group.key))}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.375rem 0.875rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: groupActive ? "#315E9C" : "rgba(255,255,255,0.75)",
                    backgroundColor: groupActive ? "rgba(49, 94, 156,0.12)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {t(group.key as keyof typeof t)}
                  <ChevronDown size={14} style={{ transform: openGroup === group.key ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                </button>
                <div
                  className="nav-dropdown-panel"
                  style={{
                    position: "absolute",
                    // Flush against the trigger (no marginTop gap): a gap here
                    // is dead space that belongs to neither the button nor the
                    // panel, so moving the mouse diagonally from one to the
                    // other crosses it and fires mouseleave on .nav-dropdown
                    // before the pointer ever reaches the panel, closing the
                    // menu mid-click. The panel's own padding below already
                    // gives the same visual breathing room without the gap.
                    top: "100%",
                    left: 0,
                    minWidth: "200px",
                    backgroundColor: "#15223a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.625rem",
                    padding: "0.375rem",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
                    display: openGroup === group.key ? "block" : "none",
                  }}
                >
                  {group.items.map(({ key, href }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/");
                    return (
                      <Link
                        key={key}
                        href={href}
                        onClick={() => setOpenGroup(null)}
                        style={{
                          display: "block",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "0.375rem",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: isActive ? "#315E9C" : "rgba(255,255,255,0.8)",
                          backgroundColor: isActive ? "rgba(49, 94, 156,0.12)" : "transparent",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t(key as keyof typeof t)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <ThemeToggle />
          <LocaleSwitcher />
        </div>

        {/* Mobile hamburger */}
        <div style={{ alignItems: "center", gap: "0.25rem" }} className="show-mobile">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: "white", background: "none", border: "none", cursor: "pointer", padding: "0.5rem" }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            backgroundColor: "#0d1b2a",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "1rem 1.5rem 1.5rem",
          }}
        >
          {navLinks.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "0.75rem 0",
                color: "rgba(255,255,255,0.85)",
                fontSize: "1rem",
                fontWeight: 500,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {t(key as keyof typeof t)}
            </Link>
          ))}
          {visibleNavGroups.map((group) => (
            <div key={group.key}>
              <div style={{ paddingTop: "1rem", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                {t(group.key as keyof typeof t)}
              </div>
              {group.items.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "0.75rem 0",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "1rem",
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {t(key as keyof typeof t)}
                </Link>
              ))}
            </div>
          ))}
          <div style={{ marginTop: "1rem" }}>
            <LocaleSwitcher />
          </div>
        </div>
      )}

      <style>{`
        .hidden-mobile { display: flex; }
        .show-mobile { display: none; }
        @media (max-width: 1024px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (max-width: 768px) {
          .site-navbar { top: 0 !important; }
        }
      `}</style>
    </header>
  );
}

// Switches locale while staying on the current page (e.g. /servicos ->
// /en/services) instead of bouncing to the homepage — usePathname() from
// "@/i18n/navigation" already returns the locale-agnostic internal
// pathname (e.g. "/servicos" even while on /en/services), which
// next-intl's Link then re-localizes for the target locale.
function LocaleSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  return (
    <div style={{ display: "flex", gap: "0.25rem", marginLeft: "0.5rem" }}>
      <Link
        // usePathname() returns the union of every known pathname, including
        // dynamic ones (e.g. "/sobre/[slug]") that Link's typed href only
        // accepts together with their params — which aren't known here.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        href={pathname as any}
        locale="pt"
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: locale === "pt" ? "white" : "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        PT
      </Link>
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        href={pathname as any}
        locale="en"
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: locale === "en" ? "white" : "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        EN
      </Link>
    </div>
  );
}
