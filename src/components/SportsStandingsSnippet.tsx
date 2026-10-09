import { Link } from "@/i18n/navigation";
import type { StandingRow } from "@/lib/sports";

const BRAND = "#4361EE";
const SNIPPET_ROWS = 6;

// Server-rendered from data the home page already fetched — no fetch of its
// own, same role ElectionBanner.tsx plays for the election block. Shows the
// top rows only for space, same as any home teaser — the full table (all 20
// teams) is on /esportes; see src/lib/sports.ts's getBestStandings for where
// this data actually comes from.
export function SportsStandingsSnippet({ standings, locale }: { standings: StandingRow[] | null; locale: string }) {
  if (!standings || standings.length === 0) {
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
      {updatedLabel && (
        <div style={{ fontSize: "0.6875rem", color: "var(--site-faint)", marginBottom: "0.5rem" }}>
          {locale === "en" ? `Updated ${updatedLabel}` : `Atualizado em ${updatedLabel}`}
        </div>
      )}
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
          {standings.slice(0, SNIPPET_ROWS).map((row) => (
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
