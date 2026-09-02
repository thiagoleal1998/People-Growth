"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { key: "about", href: "/sobre" as const },
  { key: "services", href: "/servicos" as const },
  { key: "newsletter", href: "/mea-sententia" as const },
  { key: "portfolio", href: "/portfolio" as const },
  { key: "courses", href: "/cursos" as const },
  { key: "resources", href: "/recursos" as const },
  { key: "media", href: "/na-midia" as const },
  { key: "contact", href: "/contato" as const },
];

export function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "rgba(13, 27, 42, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <nav className="container-xl" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4rem" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="People & Growth" style={{ height: "3rem", width: "auto" }} />
          ) : (
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.25rem",
                background: "linear-gradient(135deg, #4361EE, #06D6A0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              People &amp; Growth
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
                  color: isActive ? "#4361EE" : "rgba(255,255,255,0.75)",
                  backgroundColor: isActive ? "rgba(67,97,238,0.12)" : "transparent",
                  transition: "all 0.2s",
                }}
              >
                {t(key as keyof typeof t)}
              </Link>
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
      `}</style>
    </header>
  );
}

function LocaleSwitcher() {
  return (
    <div style={{ display: "flex", gap: "0.25rem", marginLeft: "0.5rem" }}>
      <Link
        href="/"
        locale="pt"
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        PT
      </Link>
      <Link
        href="/"
        locale="en"
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        EN
      </Link>
    </div>
  );
}
