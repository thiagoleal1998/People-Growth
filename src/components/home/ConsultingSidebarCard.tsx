import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

// `icon` is an already-rendered element (<Target size={13} .../>), not the
// icon component itself — a bare component reference can't be handed down
// as prop data across a server/client boundary, only data and elements (a
// moot point here since this card itself needs no client interactivity,
// but notification-style props like this do get reused from client
// contexts too).
type Pillar = { icon: ReactNode; label: string; color: string };

// Plain presentational — no state of its own. Its extra height (beyond
// its own natural content) is set imperatively, straight on this DOM node
// by id, from ClampedNewsList's recompute() — see the comment there for
// why that has to be a single component writing to this one rather than
// two components each watching the other's size.
export function ConsultingSidebarCard({ locale, pillars }: { locale: string; pillars: Pillar[] }) {
  return (
    <div
      id="home-consulting-card"
      style={{ marginTop: "0.875rem", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid var(--site-border)", display: "flex", flexDirection: "column" }}
    >
      <div style={{ backgroundColor: "#0d1b2a", color: "white", padding: "0.625rem 1rem", fontWeight: 800, fontSize: "0.8125rem", letterSpacing: "0.04em" }}>
        {locale === "en" ? "OUR CONSULTING" : "NOSSA CONSULTORIA"}
      </div>
      <div style={{ padding: "1rem", backgroundColor: "var(--site-card)", flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)", marginBottom: "0.5rem", lineHeight: 1.35 }}>
          {locale === "en" ? "Strategy, data and AI for businesses that want to grow" : "Estratégia, dados e IA para negócios que querem crescer"}
        </p>
        <p style={{ fontSize: "0.8125rem", color: "var(--site-muted)", lineHeight: 1.5, marginBottom: "0.875rem" }}>
          {locale === "en"
            ? "Diagnosis, growth, Business Intelligence and AI-driven automation."
            : "Diagnóstico, growth, Business Intelligence e automação com inteligência artificial."}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.625rem", marginBottom: "1rem" }}>
          {pillars.map(({ icon, label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.4375rem" }}>
              <div style={{ width: "1.625rem", height: "1.625rem", flexShrink: 0, borderRadius: "0.4375rem", backgroundColor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--site-muted)", lineHeight: 1.25 }}>{label}</span>
            </div>
          ))}
        </div>
        <Link
          href="/servicos"
          style={{ display: "block", marginTop: "auto", textAlign: "center", backgroundColor: "#C89A4A", color: "#0d1b2a", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none" }}
        >
          {locale === "en" ? "See our consulting" : "Conhecer a consultoria"}
        </Link>
      </div>
    </div>
  );
}
