import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  COMPETITIONS,
  COMPETITION_ORDER,
  getCompetitionFixtures,
  getCompetitionTeams,
  getStandings,
  getTeamFixtures,
  type Competition,
  type Fixture,
  type StandingRow,
} from "@/lib/sports";
import { ClubMenu } from "@/components/ClubMenu";

export const revalidate = 180;

export const metadata: Metadata = {
  title: "Esportes — tabela e resultados do Brasileirão",
  description: "Classificação atualizada do Brasileirão Série A e B, jogos ao vivo, próximos jogos e resultados por clube.",
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

function StandingsTable({ standings }: { standings: StandingRow[] | null }) {
  if (!standings || standings.length === 0) {
    return <p style={{ color: "var(--site-faint)", fontSize: "0.9rem", padding: "1rem 0" }}>Tabela indisponível no momento.</p>;
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
                {row.description && <div style={{ fontSize: "0.6875rem", color: "var(--site-faint)", marginTop: "0.125rem" }}>{row.description}</div>}
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

function FixtureRow({ fixture }: { fixture: Fixture }) {
  const date = new Date(fixture.date);
  const dateLabel = date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const isLive = fixture.status === "live";
  const isFinished = fixture.status === "finished";
  const scoreLabel = isLive || isFinished ? `${fixture.homeGoals ?? 0} – ${fixture.awayGoals ?? 0}` : dateLabel;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0", borderTop: "1px solid var(--site-border)" }}>
      <div style={{ width: "4.5rem", flexShrink: 0, fontSize: "0.75rem", color: isLive ? "#DC2626" : "var(--site-muted)", fontWeight: isLive ? 800 : 600 }}>
        {isLive ? (fixture.elapsed ? `${fixture.elapsed}'` : "Ao vivo") : dateLabel.split(" ")[0] ?? dateLabel}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.875rem", color: "var(--site-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "right" }}>
          {fixture.homeTeamName}
        </span>
        <span style={{ fontWeight: 800, color: isLive || isFinished ? BRAND : "var(--site-muted)", fontSize: "0.875rem", flexShrink: 0, minWidth: "3.5rem", textAlign: "center" }}>
          {scoreLabel}
        </span>
        <span style={{ fontSize: "0.875rem", color: "var(--site-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {fixture.awayTeamName}
        </span>
      </div>
    </div>
  );
}

function FixtureList({ fixtures, emptyLabel }: { fixtures: Fixture[] | null; emptyLabel: string }) {
  if (!fixtures || fixtures.length === 0) {
    return <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>{emptyLabel}</p>;
  }
  return (
    <div>
      {fixtures.map((fixture) => (
        <FixtureRow key={fixture.id} fixture={fixture} />
      ))}
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
  const clubeId = rawClube ? Number(rawClube) : null;

  const [standings, upcoming, recent, teams] = await Promise.all([
    info.format === "table" ? getStandings(competition) : Promise.resolve(null),
    getCompetitionFixtures(competition, { next: 10 }),
    getCompetitionFixtures(competition, { last: 10 }),
    getCompetitionTeams(competition),
  ]);
  const clubFixtures = clubeId ? await getTeamFixtures(clubeId) : null;
  const clubName = clubeId ? (teams ?? []).find((t) => t.id === clubeId)?.name ?? null : null;

  return (
    <section className="section-padding esportes-page" style={{ backgroundColor: "var(--site-bg)", minHeight: "70vh" }}>
      <div className="container-xl" style={{ maxWidth: "1100px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1rem", color: BRAND, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
          ← Voltar para o início
        </Link>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ color: BRAND, fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>Esportes</div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>{info.name_pt}</h1>
        </header>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
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
          <ClubMenu competition={competition} clubeId={clubeId} teams={teams ?? []} locale="pt" />
        </div>

        {clubeId ? (
          <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>{clubName ?? "Clube"} — jogos</h2>
            <FixtureList fixtures={clubFixtures} emptyLabel="Nenhum jogo encontrado para este clube." />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {info.format === "table" && (
              <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Classificação</h2>
                <StandingsTable standings={standings} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="esportes-fixtures-grid">
              <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Próximos jogos</h2>
                <FixtureList fixtures={upcoming} emptyLabel="Nenhum jogo agendado no momento." />
              </div>
              <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Últimos resultados</h2>
                <FixtureList fixtures={recent} emptyLabel="Nenhum resultado disponível." />
              </div>
            </div>
          </div>
        )}

        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>Fonte: API-Football.</p>
      </div>

      <style>{`
        body:has(.esportes-page) .category-nav,
        body:has(.esportes-page) .social-sidebar { display: none !important; }
        @media (max-width: 720px) {
          .esportes-fixtures-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
