import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { COMPETITIONS, COMPETITION_ORDER, getTodayFixtures, type Competition, type Fixture } from "@/lib/sports";

export const revalidate = 180;

export const metadata: Metadata = {
  title: "Esportes — jogos ao vivo do Brasileirão",
  description: "Jogos ao vivo e de hoje do Brasileirão Série A e B, Copa do Brasil e Libertadores.",
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

function ComingSoonNote({ text }: { text: string }) {
  return (
    <p style={{ fontSize: "0.8125rem", color: "var(--site-faint)", padding: "0.75rem 1rem", backgroundColor: "var(--site-surface-alt)", borderRadius: "0.625rem" }}>
      {text}
    </p>
  );
}

export default async function EsportesPage({
  searchParams,
}: {
  searchParams: Promise<{ competicao?: string }>;
}) {
  const { competicao: rawCompeticao } = await searchParams;
  const competition: Competition = COMPETITION_ORDER.includes(rawCompeticao as Competition) ? (rawCompeticao as Competition) : "serie_a";
  const info = COMPETITIONS[competition];

  const allToday = await getTodayFixtures();
  const todayFixtures = (allToday ?? []).filter((f) => f.competition === competition);

  return (
    <section className="section-padding esportes-page" style={{ backgroundColor: "var(--site-bg)", minHeight: "70vh" }}>
      <div className="container-xl" style={{ maxWidth: "900px" }}>
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
          <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Jogos de hoje</h2>
            {todayFixtures.length === 0 ? (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Nenhum jogo desta competição hoje.</p>
            ) : (
              <div>
                {todayFixtures.map((fixture) => (
                  <FixtureRow key={fixture.id} fixture={fixture} />
                ))}
              </div>
            )}
          </div>

          <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Classificação, próximos jogos e jogos por clube</h2>
            <ComingSoonNote text="Em breve — a fonte de dados atual só libera jogos ao vivo e de hoje para a temporada em andamento." />
          </div>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>Fonte: API-Football.</p>
      </div>

      <style>{`
        body:has(.esportes-page) .category-nav,
        body:has(.esportes-page) .social-sidebar { display: none !important; }
      `}</style>
    </section>
  );
}
