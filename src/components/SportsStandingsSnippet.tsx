import { Link } from "@/i18n/navigation";
import type { StandingRow } from "@/lib/sports";

const BRAND = "#4361EE";

// Server-rendered from data the home page already fetched — no fetch of its
// own, same role ElectionBanner.tsx plays for the election block. Top 5
// only — that's the free data source's own limit (see src/lib/sports.ts),
// disclosed in the heading rather than hidden.
export function SportsStandingsSnippet({ standings, locale }: { standings: StandingRow[] | null; locale: string }) {
  if (!standings || standings.length === 0) {
    return (
      <div style={{ fontSize: "0.875rem", color: "var(--site-faint)", padding: "1rem 0" }}>
        {locale === "en" ? "Standings unavailable right now." : "Classificação indisponível no momento."}
      </div>
    );
  }

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ color: "var(--site-muted)", textAlign: "left" }}>
            <th style={{ padding: "0.375rem 0.5rem", fontWeight: 600 }}>#</th>
            <th style={{ padding: "0.375rem 0.5rem", fontWeight: 600 }}>{locale === "en" ? "Club" : "Clube"}</th>
            <th style={{ padding: "0.375rem 0.5rem", fontWeight: 600, textAlign: "center" }}>J</th>
            <th style={{ padding: "0.375rem 0.5rem", fontWeight: 600, textAlign: "center" }}>SG</th>
            <th style={{ padding: "0.375rem 0.5rem", fontWeight: 600, textAlign: "center" }}>Pts</th>
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
      <Link
        href="/esportes"
        style={{ display: "inline-block", marginTop: "0.75rem", color: BRAND, fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600 }}
      >
        {locale === "en" ? "All competitions ›" : "Todas as competições ›"}
      </Link>
    </div>
  );
}
