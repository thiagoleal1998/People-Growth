"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { TeamCrest } from "@/components/TeamCrest";
import { COMPETITIONS, COMPETITION_ORDER, type Competition, type StandingRow } from "@/lib/sports";

const BRAND = "#315E9C";

// Server-rendered data the home page already fetched for every table-format
// competition (see getBestStandings calls in page.tsx) — no fetch of its
// own, same role ElectionBanner.tsx plays for the election block. Tabs let
// the viewer flip between leagues instead of only ever seeing Série A, and
// the table scrolls internally instead of hard-capping at a handful of rows
// — both requested after the previous version only showed the top 6 Série A
// rows with no way to see the rest.
export function SportsStandingsSnippet({
  standingsByCompetition,
  locale,
}: {
  standingsByCompetition: Partial<Record<Competition, StandingRow[] | null>>;
  locale: string;
}) {
  const availableCompetitions = COMPETITION_ORDER.filter((c) => (standingsByCompetition[c]?.length ?? 0) > 0);
  const [active, setActive] = useState<Competition | null>(availableCompetitions[0] ?? null);
  const activeCompetition = active && availableCompetitions.includes(active) ? active : availableCompetitions[0] ?? null;
  const standings = activeCompetition ? standingsByCompetition[activeCompetition] : null;

  if (!activeCompetition || !standings || standings.length === 0) {
    return (
      <div style={{ fontSize: "0.875rem", color: "var(--site-faint)", padding: "1rem 0" }}>
        {locale === "en" ? "Standings unavailable right now." : "Classificação indisponível no momento."}
      </div>
    );
  }

  const updatedAt = standings[0]?.updatedAt;
  const updatedLabel = updatedAt
    ? new Date(updatedAt.replace(" ", "T")).toLocaleString(locale === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div>
      {availableCompetitions.length > 1 && (
        <div style={{ display: "flex", gap: "0.375rem", overflowX: "auto", marginBottom: "0.75rem", paddingBottom: "0.25rem" }}>
          {availableCompetitions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3125rem",
                flexShrink: 0,
                padding: "0.3125rem 0.625rem",
                borderRadius: "9999px",
                border: "1px solid var(--site-border)",
                backgroundColor: c === activeCompetition ? BRAND : "transparent",
                color: c === activeCompetition ? "white" : "var(--site-muted)",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <TeamCrest src={COMPETITIONS[c].logo} alt="" size={16} />
              {locale === "en" ? COMPETITIONS[c].name_en : COMPETITIONS[c].name_pt}
            </button>
          ))}
        </div>
      )}

      {updatedLabel && (
        <div style={{ fontSize: "0.6875rem", color: "var(--site-faint)", marginBottom: "0.5rem" }}>
          {locale === "en" ? `Updated ${updatedLabel}` : `Atualizado em ${updatedLabel}`}
        </div>
      )}
      <div style={{ maxHeight: "19rem", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
          <thead>
            <tr style={{ color: "var(--site-muted)", textAlign: "left" }}>
              <th style={{ padding: "0.375rem 0.5rem", fontWeight: 600, position: "sticky", top: 0, backgroundColor: "var(--site-card)" }}>#</th>
              <th style={{ padding: "0.375rem 0.5rem", fontWeight: 600, position: "sticky", top: 0, backgroundColor: "var(--site-card)" }}>{locale === "en" ? "Club" : "Clube"}</th>
              <th style={{ padding: "0.375rem 0.5rem", fontWeight: 600, textAlign: "center", position: "sticky", top: 0, backgroundColor: "var(--site-card)" }}>J</th>
              <th style={{ padding: "0.375rem 0.5rem", fontWeight: 600, textAlign: "center", position: "sticky", top: 0, backgroundColor: "var(--site-card)" }}>SG</th>
              <th style={{ padding: "0.375rem 0.5rem", fontWeight: 600, textAlign: "center", position: "sticky", top: 0, backgroundColor: "var(--site-card)" }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.teamId} style={{ borderTop: "1px solid var(--site-border)" }}>
                <td style={{ padding: "0.5rem", fontWeight: 700, color: "var(--site-text-secondary)" }}>{row.rank}</td>
                <td style={{ padding: "0.5rem", color: "var(--site-text)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {row.teamLogo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.teamLogo} alt="" width={18} height={18} style={{ objectFit: "contain" }} />
                  )}
                  {row.teamName}
                </td>
                <td style={{ padding: "0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.played}</td>
                <td style={{ padding: "0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.goalsDiff}</td>
                <td style={{ padding: "0.5rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link
        href="/esportes"
        style={{ display: "inline-block", marginTop: "0.75rem", color: BRAND, fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600 }}
      >
        {locale === "en" ? "All competitions ›" : "Todas as competições ›"}
      </Link>
    </div>
  );
}
