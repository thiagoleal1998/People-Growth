"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TeamCrest } from "@/components/TeamCrest";
import { COMPETITIONS, COMPETITION_ORDER, type Competition, type StandingRow } from "@/lib/sports";

const BRAND = "#315E9C";

// Server-rendered data the home page already fetched for every table-format
// competition (see getBestStandings calls in page.tsx) — no fetch of its
// own, same role ElectionBanner.tsx plays for the election block.
//
// Owns its whole card (header included, not just the table) because the
// header now has to show whichever competition is active, which is client
// state — a first pass used a row of pill buttons, one per competition, but
// that's five crammed into a ~380px sidebar card at once; this instead keeps
// the original single-competition header bar and flips between them with
// prev/next arrows either side of the name, same interaction as the home
// page's other carousels. The table scrolls internally instead of hard-
// capping at a handful of rows (the other half of the original ask).
export function SportsStandingsSnippet({
  standingsByCompetition,
  locale,
}: {
  standingsByCompetition: Partial<Record<Competition, StandingRow[] | null>>;
  locale: string;
}) {
  const availableCompetitions = COMPETITION_ORDER.filter((c) => (standingsByCompetition[c]?.length ?? 0) > 0);
  const [index, setIndex] = useState(0);
  const activeCompetition = availableCompetitions[index % Math.max(availableCompetitions.length, 1)] ?? null;
  const standings = activeCompetition ? standingsByCompetition[activeCompetition] : null;

  return (
    <>
      <div style={{ backgroundColor: BRAND, color: "white", padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
        {activeCompetition ? (
          <TeamCrest src={COMPETITIONS[activeCompetition].logo} alt="" size={28} />
        ) : (
          <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)" }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: "0.8125rem", letterSpacing: "0.04em" }}>{locale === "en" ? "Standings" : "Classificação"}</div>
          {activeCompetition && (
            <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.75)", marginTop: "0.0625rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {locale === "en" ? COMPETITIONS[activeCompetition].name_en : COMPETITIONS[activeCompetition].name_pt}
            </div>
          )}
        </div>
        {availableCompetitions.length > 1 && (
          <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + availableCompetitions.length) % availableCompetitions.length)}
              aria-label={locale === "en" ? "Previous competition" : "Competição anterior"}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", backgroundColor: "transparent", color: "white", cursor: "pointer" }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % availableCompetitions.length)}
              aria-label={locale === "en" ? "Next competition" : "Próxima competição"}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", backgroundColor: "transparent", color: "white", cursor: "pointer" }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: "0.875rem 1rem", backgroundColor: "var(--site-card)" }}>
        {!activeCompetition || !standings || standings.length === 0 ? (
          <div style={{ fontSize: "0.875rem", color: "var(--site-faint)", padding: "1rem 0" }}>
            {locale === "en" ? "Standings unavailable right now." : "Classificação indisponível no momento."}
          </div>
        ) : (
          <>
            {standings[0]?.updatedAt && (
              <div style={{ fontSize: "0.6875rem", color: "var(--site-faint)", marginBottom: "0.5rem" }}>
                {locale === "en"
                  ? `Updated ${new Date(standings[0].updatedAt.replace(" ", "T")).toLocaleString("en-US", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
                  : `Atualizado em ${new Date(standings[0].updatedAt.replace(" ", "T")).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`}
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
          </>
        )}
      </div>
    </>
  );
}
