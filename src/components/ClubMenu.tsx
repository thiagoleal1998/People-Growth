import type { Team } from "@/lib/sports";

// A club picker that opens as a styled list of links, same pattern as
// StateMenu.tsx on /eleicoes — native <details>, no JavaScript needed.
export function ClubMenu({ competition, clubeId, teams, locale }: { competition: string; clubeId: number | null; teams: Team[]; locale: string }) {
  const current = teams.find((t) => t.id === clubeId)?.name ?? (locale === "en" ? "All clubs" : "Todos os clubes");
  return (
    <details className="club-menu" style={{ position: "relative", display: "inline-block" }}>
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.875rem",
          borderRadius: "9999px",
          border: "1px solid var(--site-border-strong)",
          backgroundColor: "var(--site-card)",
          color: "var(--site-text)",
          fontWeight: 700,
          fontSize: "0.875rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          userSelect: "none",
        }}
      >
        <span style={{ color: "var(--site-muted)", fontWeight: 600 }}>{locale === "en" ? "Club" : "Clube"}</span>
        {current}
        <span className="club-menu-chevron" aria-hidden style={{ display: "inline-block", transition: "transform 150ms", color: "#4361EE" }}>
          ▾
        </span>
      </summary>
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 0.375rem)",
          left: 0,
          zIndex: 50,
          width: "240px",
          maxHeight: "320px",
          overflowY: "auto",
          padding: "0.375rem",
          borderRadius: "0.75rem",
          border: "1px solid var(--site-border-strong)",
          backgroundColor: "var(--site-card)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
        }}
      >
        <a
          href={`?competicao=${competition}`}
          style={{
            display: "block",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: clubeId === null ? 800 : 500,
            color: clubeId === null ? "#4361EE" : "var(--site-text-secondary)",
            backgroundColor: clubeId === null ? "rgba(67,97,238,0.08)" : "transparent",
          }}
        >
          {locale === "en" ? "All clubs" : "Todos os clubes"}
        </a>
        {teams.map((team) => (
          <a
            key={team.id}
            href={`?competicao=${competition}&clube=${team.id}`}
            aria-current={team.id === clubeId ? "true" : undefined}
            style={{
              display: "block",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: team.id === clubeId ? 800 : 500,
              color: team.id === clubeId ? "#4361EE" : "var(--site-text-secondary)",
              backgroundColor: team.id === clubeId ? "rgba(67,97,238,0.08)" : "transparent",
            }}
          >
            {team.name}
          </a>
        ))}
      </div>
      <style>{`
        .club-menu > summary::-webkit-details-marker { display: none; }
        .club-menu[open] .club-menu-chevron { transform: rotate(180deg); }
      `}</style>
    </details>
  );
}
