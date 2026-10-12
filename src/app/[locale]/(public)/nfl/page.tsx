import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getCurrentWeekGames, getStandingsByDivision, type NflDivisionStandings, type NflGame } from "@/lib/nfl";
import { TeamCrest } from "@/components/TeamCrest";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "NFL — jogos e classificação",
  description: "Resultados, próximos jogos e classificação por divisão da NFL.",
};

// Portuguese-only, same as /esportes — team names stay in English, matching
// how Brazilian sports media refers to NFL clubs.
const BRAND = "#315E9C";

const cardStyle = {
  borderRadius: "0.75rem",
  border: "1px solid var(--site-border-strong)",
  backgroundColor: "var(--site-card)",
  padding: "1rem 1.125rem",
} as const;

function GameCard({ game }: { game: NflGame }) {
  const isLive = game.status === "live";
  const hasScore = game.status !== "scheduled";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.875rem 0.75rem",
        borderRadius: "0.625rem",
        border: "1px solid var(--site-border-strong)",
        backgroundColor: "var(--site-card)",
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: "0.625rem",
          fontWeight: 800,
          color: isLive ? "#DC2626" : "var(--site-muted)",
          backgroundColor: isLive ? "rgba(220,38,38,0.1)" : "var(--site-surface-alt)",
          padding: "0.1875rem 0.5rem",
          borderRadius: "9999px",
          textAlign: "center",
        }}
      >
        {game.statusDetail}
      </span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", flex: 1, minWidth: 0 }}>
          <TeamCrest src={game.away.logo} alt={game.away.name} size={36} />
          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--site-text)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
            {game.away.abbreviation}
          </span>
        </div>
        <span style={{ fontWeight: 800, color: BRAND, fontSize: "1.0625rem", flexShrink: 0 }}>
          {hasScore ? `${game.away.score}–${game.home.score}` : "×"}
        </span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", flex: 1, minWidth: 0 }}>
          <TeamCrest src={game.home.logo} alt={game.home.name} size={36} />
          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--site-text)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
            {game.home.abbreviation}
          </span>
        </div>
      </div>
    </div>
  );
}

function DivisionTable({ division }: { division: NflDivisionStandings }) {
  return (
    <div style={{ ...cardStyle, padding: "1rem" }}>
      <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.625rem" }}>{division.division}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ color: "var(--site-muted)", textAlign: "left" }}>
            <th style={{ padding: "0.375rem 0.25rem" }}>Clube</th>
            <th style={{ padding: "0.375rem 0.25rem", textAlign: "center" }}>V</th>
            <th style={{ padding: "0.375rem 0.25rem", textAlign: "center" }}>D</th>
            <th style={{ padding: "0.375rem 0.25rem", textAlign: "center" }}>E</th>
            <th style={{ padding: "0.375rem 0.25rem", textAlign: "center" }}>Aprov.</th>
          </tr>
        </thead>
        <tbody>
          {division.teams.map((team) => (
            <tr key={team.teamId} style={{ borderTop: "1px solid var(--site-border)" }}>
              <td style={{ padding: "0.375rem 0.25rem", color: "var(--site-text)", fontWeight: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <TeamCrest src={team.logo} alt={team.name} size={18} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</span>
                </div>
              </td>
              <td style={{ padding: "0.375rem 0.25rem", textAlign: "center", color: "var(--site-muted)" }}>{team.wins}</td>
              <td style={{ padding: "0.375rem 0.25rem", textAlign: "center", color: "var(--site-muted)" }}>{team.losses}</td>
              <td style={{ padding: "0.375rem 0.25rem", textAlign: "center", color: "var(--site-muted)" }}>{team.ties}</td>
              <td style={{ padding: "0.375rem 0.25rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{team.winPercent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function NflPage() {
  const [games, standings] = await Promise.all([getCurrentWeekGames(), getStandingsByDivision()]);

  return (
    <section className="section-padding esportes-page" style={{ backgroundColor: "var(--site-bg)", minHeight: "70vh" }}>
      <div className="container-xl" style={{ maxWidth: "1000px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1rem", color: BRAND, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
          ← Voltar para o início
        </Link>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ color: BRAND, fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>Esportes</div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>NFL</h1>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
              Jogos da semana{games && games[0]?.week ? ` (semana ${games[0].week})` : ""}
            </h2>
            {games && games.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Jogos indisponíveis no momento.</p>
            )}
          </div>

          <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Classificação por divisão</h2>
            {standings && standings.length > 0 ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                  {standings
                    .filter((d) => d.conference === "AFC")
                    .map((division) => (
                      <DivisionTable key={division.division} division={division} />
                    ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                  {standings
                    .filter((d) => d.conference === "NFC")
                    .map((division) => (
                      <DivisionTable key={division.division} division={division} />
                    ))}
                </div>
              </>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Classificação indisponível no momento.</p>
            )}
          </div>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>Fonte: ESPN.</p>
      </div>

      <style>{`
        body:has(.esportes-page) .category-nav,
        body:has(.esportes-page) .social-sidebar { display: none !important; }
      `}</style>
    </section>
  );
}
