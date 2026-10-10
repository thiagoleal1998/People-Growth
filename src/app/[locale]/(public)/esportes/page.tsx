import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  COMPETITIONS,
  COMPETITION_ORDER,
  attachDetailIds,
  getBestStandings,
  getClubFixtures,
  getCurrentRoundFixtures,
  getTodayFixtures,
  type Competition,
  type Fixture,
  type StandingRow,
} from "@/lib/sports";

export const revalidate = 180;

export const metadata: Metadata = {
  title: "Esportes — tabela e jogos do Brasileirão",
  description: "Classificação completa, jogos da rodada e placar ao vivo do Brasileirão Série A e B, Copa do Brasil e Libertadores.",
};

// Portuguese-only, same as /eleicoes — Brazilian competition data for a
// Brazilian audience, no locale branching needed here.
const BRAND = "#4361EE";

const cardStyle = {
  borderRadius: "0.75rem",
  border: "1px solid var(--site-border-strong)",
  backgroundColor: "var(--site-card)",
  padding: "1rem 1.125rem",
} as const;

function FixtureRow({ fixture }: { fixture: Fixture }) {
  const date = new Date(fixture.date);
  const dateLabel = date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const isLive = fixture.status === "live";
  const isFinished = fixture.status === "finished";
  const scoreLabel = isLive || isFinished ? `${fixture.homeGoals ?? 0} – ${fixture.awayGoals ?? 0}` : dateLabel;
  // Every card links out, even a scraped fixture with no resolved detailId —
  // its own (non-API-Football) id just won't match anything real, which the
  // match-detail page already handles gracefully (an "indisponível no
  // momento" message, not a 404 — see getMatchDetail's null case there)
  // rather than leaving the card dead with nothing to click at all.
  return (
    <a
      href={`/esportes/partida/${fixture.detailId ?? fixture.id}`}
      style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0", borderTop: "1px solid var(--site-border)", textDecoration: "none" }}
    >
      <div style={{ width: "4.5rem", flexShrink: 0, fontSize: "0.75rem", color: isLive ? "#DC2626" : "var(--site-muted)", fontWeight: isLive ? 800 : 600 }}>
        {isLive ? (fixture.elapsed ? `${fixture.elapsed}'` : "Ao vivo") : dateLabel.split(",")[0] ?? dateLabel}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.375rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--site-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
            {fixture.homeTeamName}
          </span>
          {fixture.homeTeamLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fixture.homeTeamLogo} alt="" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} />
          )}
        </div>
        <span style={{ fontWeight: 800, color: isLive || isFinished ? BRAND : "var(--site-muted)", fontSize: "0.875rem", flexShrink: 0, minWidth: "3.5rem", textAlign: "center" }}>
          {scoreLabel}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "0.375rem" }}>
          {fixture.awayTeamLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fixture.awayTeamLogo} alt="" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} />
          )}
          <span style={{ fontSize: "0.875rem", color: "var(--site-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fixture.awayTeamName}
          </span>
        </div>
      </div>
    </a>
  );
}

function ComingSoonNote({ text }: { text: string }) {
  return (
    <p style={{ fontSize: "0.8125rem", color: "var(--site-faint)", padding: "0.75rem 1rem", backgroundColor: "var(--site-surface-alt)", borderRadius: "0.625rem" }}>
      {text}
    </p>
  );
}

function StandingsTable({ standings }: { standings: StandingRow[] | null }) {
  if (!standings || standings.length === 0) {
    return <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Classificação indisponível no momento.</p>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ color: "var(--site-muted)", textAlign: "left" }}>
            <th style={{ padding: "0.5rem" }}>#</th>
            <th style={{ padding: "0.5rem" }}>Clube</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>J</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>V</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>E</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>D</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>GP</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>GC</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>SG</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => (
            <tr key={row.teamId} style={{ borderTop: "1px solid var(--site-border)" }}>
              <td style={{ padding: "0.5rem", fontWeight: 700, color: "var(--site-text-secondary)" }}>{row.rank}</td>
              <td style={{ padding: "0.5rem", color: "var(--site-text)", fontWeight: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {row.teamLogo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.teamLogo} alt="" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} />
                  )}
                  <span>{row.teamName}</span>
                </div>
              </td>
              <td style={{ padding: "0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.played}</td>
              <td style={{ padding: "0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.win}</td>
              <td style={{ padding: "0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.draw}</td>
              <td style={{ padding: "0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.lose}</td>
              <td style={{ padding: "0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.goalsFor}</td>
              <td style={{ padding: "0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.goalsAgainst}</td>
              <td style={{ padding: "0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.goalsDiff}</td>
              <td style={{ padding: "0.5rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function EsportesPage({
  searchParams,
}: {
  searchParams: Promise<{ competicao?: string; clube?: string }>;
}) {
  const { competicao: rawCompeticao, clube: rawClube } = await searchParams;
  const competition: Competition = COMPETITION_ORDER.includes(rawCompeticao as Competition) ? (rawCompeticao as Competition) : "serie_a";
  const info = COMPETITIONS[competition];

  const [allToday, standings, rawRoundFixtures] = await Promise.all([
    getTodayFixtures(),
    info.format === "table" ? getBestStandings(competition) : Promise.resolve(null),
    getCurrentRoundFixtures(competition),
  ]);
  const todayFixtures = (allToday ?? []).filter((f) => f.competition === competition);
  const roundFixtures = rawRoundFixtures ? await attachDetailIds(rawRoundFixtures) : null;

  // Only a club that's actually in this competition's own standings is a
  // valid choice — besides being the source of the selector list itself,
  // this keeps a stray/typo'd ?clube= from quietly showing an empty "no
  // games" state that looks like a bug instead of a bad link.
  const clube = standings?.some((row) => row.teamName === rawClube) ? (rawClube as string) : null;
  const rawClubFixtures = clube ? await getClubFixtures(competition, clube) : null;
  const clubFixtures = rawClubFixtures ? await attachDetailIds(rawClubFixtures) : null;

  return (
    <section className="section-padding esportes-page" style={{ backgroundColor: "var(--site-bg)", minHeight: "70vh" }}>
      <div className="container-xl" style={{ maxWidth: "1000px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1rem", color: BRAND, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
          ← Voltar para o início
        </Link>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ color: BRAND, fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>Esportes</div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>{info.name_pt}</h1>
        </header>

        <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {COMPETITION_ORDER.map((option) => (
            <a
              key={option}
              href={`?competicao=${option}`}
              aria-current={option === competition ? "page" : undefined}
              style={{
                padding: "0.5rem 1.125rem",
                borderRadius: "0.5rem",
                border: `1px solid ${option === competition ? BRAND : "var(--site-border-strong)"}`,
                color: option === competition ? BRAND : "var(--site-text-secondary)",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              {COMPETITIONS[option].name_pt}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {todayFixtures.length > 0 && (
            <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Jogos de hoje</h2>
              <div>
                {todayFixtures.map((fixture) => (
                  <FixtureRow key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </div>
          )}

          {info.format === "table" && (
            <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Classificação</h2>
              <StandingsTable standings={standings} />
            </div>
          )}

          <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Jogos da rodada</h2>
            {roundFixtures && roundFixtures.length > 0 ? (
              <div>
                {roundFixtures.map((fixture) => (
                  <FixtureRow key={fixture.id} fixture={fixture} />
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Jogos indisponíveis no momento.</p>
            )}
          </div>

          <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Jogos por clube</h2>
            {info.format === "table" && standings && standings.length > 0 ? (
              <>
                <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "1rem" }}>
                  {standings.map((row) => (
                    <a
                      key={row.teamId}
                      href={`?competicao=${competition}&clube=${encodeURIComponent(row.teamName)}`}
                      aria-current={row.teamName === clube ? "page" : undefined}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.375rem 0.75rem",
                        borderRadius: "9999px",
                        border: `1px solid ${row.teamName === clube ? BRAND : "var(--site-border-strong)"}`,
                        color: row.teamName === clube ? BRAND : "var(--site-text-secondary)",
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        textDecoration: "none",
                      }}
                    >
                      {row.teamLogo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.teamLogo} alt="" width={16} height={16} style={{ objectFit: "contain", flexShrink: 0 }} />
                      )}
                      {row.teamName}
                    </a>
                  ))}
                </nav>
                {clube ? (
                  clubFixtures && clubFixtures.length > 0 ? (
                    <div>
                      {clubFixtures.map((fixture) => (
                        <FixtureRow key={fixture.id} fixture={fixture} />
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Jogos indisponíveis no momento.</p>
                  )
                ) : (
                  <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Escolha um clube para ver o calendário completo.</p>
                )}
              </>
            ) : (
              <ComingSoonNote text="Disponível para o Brasileirão Série A e Série B." />
            )}
          </div>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>
          Fontes: API-Football (ao vivo e hoje) e api-futebol.com.br (classificação completa e jogos da rodada).
        </p>
      </div>

      <style>{`
        body:has(.esportes-page) .category-nav,
        body:has(.esportes-page) .social-sidebar { display: none !important; }
      `}</style>
    </section>
  );
}
