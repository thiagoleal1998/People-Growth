import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  COMPETITIONS,
  COMPETITION_ORDER,
  getBestStandings,
  getClubFixtures,
  getCurrentRoundFixtures,
  getTodayFixtures,
  withReliableCrests,
  type Competition,
  type Fixture,
  type StandingRow,
} from "@/lib/sports";
import { getCurrentWeekGames, getStandingsByDivision as getNflStandingsByDivision, type NflDivisionStandings, type NflGame } from "@/lib/nfl";
import { getTodayGames, getStandingsByDivision as getNbaStandingsByDivision, type NbaDivisionStandings, type NbaGame } from "@/lib/nba";
import { NFL_LOGO_URL } from "@/lib/nfl";
import { NBA_LOGO_URL } from "@/lib/nba";
import { TeamCrest } from "@/components/TeamCrest";
import { FormatTag } from "@/components/FormatTag";
import { PeopleGrowthBadge } from "@/components/PeopleGrowthBadge";
import { PontoDeReplicaBadge } from "@/components/PontoDeReplicaBadge";
import { createClient } from "@/lib/supabase/server";
import { articleHref } from "@/lib/article-url";
import { pickLocale } from "@/lib/locale-content";
import type { Article, Author, Category } from "@/types/database.types";

export const revalidate = 180;

export const metadata: Metadata = {
  title: "Esportes — notícias, Brasileirão, NFL e NBA",
  description: "Notícias de esporte, classificação e jogos do Brasileirão Série A e B, Copa do Brasil, Libertadores, Sul-Americana, NFL e NBA.",
};

// Portuguese-only, same as /eleicoes — Brazilian competition data for a
// Brazilian audience, no locale branching needed here.
const BRAND = "#315E9C";

const cardStyle = {
  borderRadius: "0.75rem",
  border: "1px solid var(--site-border-strong)",
  backgroundColor: "var(--site-card)",
  padding: "1rem 1.125rem",
} as const;

const TABS = [
  { id: "artigos", label: "Artigos" },
  { id: "brasileirao", label: "Brasileirão" },
  { id: "nfl", label: "NFL" },
  { id: "nba", label: "NBA" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function TabNav({ active }: { active: TabId }) {
  return (
    <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
      {TABS.map((t) => (
        <a
          key={t.id}
          href={`?tab=${t.id}`}
          aria-current={t.id === active ? "page" : undefined}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1.125rem",
            borderRadius: "0.5rem",
            border: `1px solid ${t.id === active ? BRAND : "var(--site-border-strong)"}`,
            color: t.id === active ? BRAND : "var(--site-text-secondary)",
            fontWeight: 700,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          {t.id === "nfl" && <TeamCrest src={NFL_LOGO_URL} alt="" size={18} />}
          {t.id === "nba" && <TeamCrest src={NBA_LOGO_URL} alt="" size={18} />}
          {t.label}
        </a>
      ))}
    </nav>
  );
}

function FixtureRow({ fixture }: { fixture: Fixture }) {
  const date = new Date(fixture.date);
  const dateLabel = date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const isLive = fixture.status === "live";
  const isFinished = fixture.status === "finished";
  const scoreLabel = isLive || isFinished ? `${fixture.homeGoals ?? 0} – ${fixture.awayGoals ?? 0}` : dateLabel;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0", borderTop: "1px solid var(--site-border)" }}>
      <div style={{ width: "4.5rem", flexShrink: 0, fontSize: "0.75rem", color: isLive ? "#DC2626" : "var(--site-muted)", fontWeight: isLive ? 800 : 600 }}>
        {isLive ? (fixture.elapsed ? `${fixture.elapsed}'` : "Ao vivo") : dateLabel.split(",")[0] ?? dateLabel}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.375rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--site-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
            {fixture.homeTeamName}
          </span>
          <TeamCrest src={fixture.homeTeamLogo} alt={fixture.homeTeamName} size={20} />
        </div>
        <span style={{ fontWeight: 800, color: isLive || isFinished ? BRAND : "var(--site-muted)", fontSize: "0.875rem", flexShrink: 0, minWidth: "3.5rem", textAlign: "center" }}>
          {scoreLabel}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <TeamCrest src={fixture.awayTeamLogo} alt={fixture.awayTeamName} size={20} />
          <span style={{ fontSize: "0.875rem", color: "var(--site-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fixture.awayTeamName}
          </span>
        </div>
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

function StandingsTable({ standings }: { standings: StandingRow[] | null }) {
  if (!standings || standings.length === 0) {
    return <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Classificação indisponível no momento.</p>;
  }
  const legend: { color: string; label: string }[] = [];
  for (const row of standings) {
    if (row.zoneColor && row.description && !legend.some((l) => l.label === row.description)) {
      legend.push({ color: row.zoneColor, label: row.description });
    }
  }
  return (
    <div>
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
              <tr key={row.teamId} style={{ borderTop: "1px solid var(--site-border)", borderLeft: `3px solid ${row.zoneColor ?? "transparent"}` }}>
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
      {legend.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem", marginTop: "0.875rem", fontSize: "0.75rem", color: "var(--site-muted)" }}>
          {legend.map((entry) => (
            <div key={entry.color} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "0.625rem", height: "0.625rem", borderRadius: "9999px", backgroundColor: entry.color, flexShrink: 0 }} />
              {entry.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AmericanGameCard({ game }: { game: NflGame | NbaGame }) {
  const isLive = game.status === "live";
  const hasScore = game.status !== "scheduled";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "0.875rem 0.75rem", borderRadius: "0.625rem", border: "1px solid var(--site-border-strong)", backgroundColor: "var(--site-card)", minWidth: 0 }}>
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

function NflDivisionTable({ division }: { division: NflDivisionStandings }) {
  return (
    // minWidth: 0 — this card is a grid item in a repeat(auto-fit,
    // minmax(280px, 1fr)) track; without it the card refuses to shrink
    // below the table's natural content width (a long club name + 4 stat
    // columns), forcing the card wider than its track and spilling past
    // the rounded border instead of truncating the name.
    <div style={{ ...cardStyle, padding: "1rem", minWidth: 0 }}>
      <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.625rem" }}>{division.division}</h3>
      <div style={{ overflowX: "auto" }}>
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
    </div>
  );
}

function NbaDivisionTable({ division }: { division: NbaDivisionStandings }) {
  return (
    <div style={{ ...cardStyle, padding: "1rem", minWidth: 0 }}>
      <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.625rem" }}>{division.division}</h3>
      <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ color: "var(--site-muted)", textAlign: "left" }}>
            <th style={{ padding: "0.375rem 0.25rem" }}>Clube</th>
            <th style={{ padding: "0.375rem 0.25rem", textAlign: "center" }}>V</th>
            <th style={{ padding: "0.375rem 0.25rem", textAlign: "center" }}>D</th>
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
              <td style={{ padding: "0.375rem 0.25rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{team.winPercent}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// Articles tagged "esporte" — same merge-by-primary-or-extra-category logic
// as the generic /conteudo/categoria/[slug] template, just hardcoded to this
// one category since /conteudo/categoria/esporte now redirects here.
async function getSportsArticles() {
  const supabase = await createClient();
  const client = supabase as any;

  const { data: category } = await client.from("categories").select("*").eq("slug", "esporte").maybeSingle();
  if (!category) return { category: null, articles: [], authorById: new Map(), categoryById: new Map() };

  const [{ data: primaryData }, { data: extraRows }, { data: authorsData }, { data: allCategoriesData }] = await Promise.all([
    client.from("articles").select("*").eq("category_id", category.id).eq("status", "published").order("published_at", { ascending: false }),
    client.from("article_categories").select("article_id").eq("category_id", category.id),
    client.from("authors").select("*"),
    client.from("categories").select("*"),
  ]);

  const extraIds = ((extraRows ?? []) as { article_id: string }[]).map((row) => row.article_id);
  const { data: extraData } = extraIds.length > 0 ? await client.from("articles").select("*").in("id", extraIds).eq("status", "published") : { data: [] };

  const byId = new Map<string, Article>();
  for (const article of [...((primaryData ?? []) as Article[]), ...((extraData ?? []) as Article[])]) byId.set(article.id, article);
  const articles = [...byId.values()].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));

  return {
    category: category as Category,
    articles,
    authorById: new Map(((authorsData ?? []) as Author[]).map((a: Author) => [a.id, a])),
    categoryById: new Map(((allCategoriesData ?? []) as Category[]).map((c: Category) => [c.id, c])),
  };
}

export default async function EsportesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; competicao?: string; clube?: string }>;
}) {
  const { tab: rawTab, competicao: rawCompeticao, clube: rawClube } = await searchParams;
  const tab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "brasileirao";
  const tc = await getTranslations("common");

  return (
    <section className="section-padding esportes-page" style={{ backgroundColor: "var(--site-bg)", minHeight: "70vh" }}>
      <div className="container-xl" style={{ maxWidth: "1000px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1rem", color: BRAND, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
          ← Voltar para o início
        </Link>

        <div style={{ color: BRAND, fontWeight: 700, fontSize: "0.9375rem", marginBottom: "1rem" }}>Grupo Festina Esportes</div>

        <TabNav active={tab} />

        {tab === "artigos" && (
          <ArticlesTab />
        )}

        {tab === "brasileirao" && (
          <BrasileiraoTab rawCompeticao={rawCompeticao} rawClube={rawClube} />
        )}

        {tab === "nfl" && <NflTab />}

        {tab === "nba" && <NbaTab />}
      </div>

      <style>{`
        body:has(.esportes-page) .category-nav,
        body:has(.esportes-page) .social-sidebar { display: none !important; }
      `}</style>
    </section>
  );

  async function ArticlesTab() {
    const { category, articles, authorById, categoryById } = await getSportsArticles();
    return (
      <div>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "1.25rem" }}>
          Notícias de esporte
        </h1>
        {articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>Nenhum artigo publicado em esporte ainda.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {articles.map((article) => (
              <Link key={article.id} href={articleHref(article, article.category_id ? categoryById.get(article.category_id)?.slug : null)} style={{ display: "block", textDecoration: "none" }} className="hover-card">
                <article style={{ backgroundColor: "var(--site-card)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--site-border)", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "5rem",
                      height: "5rem",
                      flexShrink: 0,
                      borderRadius: "0.75rem",
                      background: article.cover_image ? `url("${article.cover_image}") center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "0.375rem" }}>
                      <FormatTag format={article.format} locale="pt" />
                      {category?.is_people_growth && <PeopleGrowthBadge />}
                      {category?.is_ponto_de_replica && <PontoDeReplicaBadge />}
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.375rem" }}>
                      {pickLocale("pt", article.title_pt, article.title_en)}
                    </h3>
                    {article.excerpt_pt && (
                      <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", lineHeight: 1.6, marginBottom: "0.625rem" }}>
                        {pickLocale("pt", article.excerpt_pt, article.excerpt_en)}
                      </p>
                    )}
                    {(article.author_id || article.published_at) && (
                      <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)" }}>
                        {article.author_id && authorById.get(article.author_id) && <>{tc("by")} {authorById.get(article.author_id)!.name} · </>}
                        {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  async function BrasileiraoTab({ rawCompeticao, rawClube }: { rawCompeticao?: string; rawClube?: string }) {
    const competition: Competition = COMPETITION_ORDER.includes(rawCompeticao as Competition) ? (rawCompeticao as Competition) : "serie_a";
    const info = COMPETITIONS[competition];

    const [allToday, standings, roundFixtures] = await Promise.all([
      getTodayFixtures(),
      info.format === "table" ? getBestStandings(competition) : Promise.resolve(null),
      getCurrentRoundFixtures(competition),
    ]);
    const todayFixtures = withReliableCrests((allToday ?? []).filter((f) => f.competition === competition), standings);
    const clube = standings?.some((row) => row.teamName === rawClube) ? (rawClube as string) : null;
    const clubFixtures = clube ? await getClubFixtures(competition, clube) : null;

    return (
      <>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <TeamCrest src={info.logo} alt="" size={44} />
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>{info.name_pt}</h1>
        </header>

        <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {COMPETITION_ORDER.map((option) => (
            <a
              key={option}
              href={`?tab=brasileirao&competicao=${option}`}
              aria-current={option === competition ? "page" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1.125rem",
                borderRadius: "0.5rem",
                border: `1px solid ${option === competition ? BRAND : "var(--site-border-strong)"}`,
                color: option === competition ? BRAND : "var(--site-text-secondary)",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              <TeamCrest src={COMPETITIONS[option].logo} alt="" size={20} />
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
                      href={`?tab=brasileirao&competicao=${competition}&clube=${encodeURIComponent(row.teamName)}`}
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
      </>
    );
  }

  async function NflTab() {
    const [games, standings] = await Promise.all([getCurrentWeekGames(), getNflStandingsByDivision()]);
    return (
      <>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem" }}>
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
                  <AmericanGameCard key={game.id} game={game} />
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
                  {standings.filter((d) => d.conference === "AFC").map((division) => (
                    <NflDivisionTable key={division.division} division={division} />
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                  {standings.filter((d) => d.conference === "NFC").map((division) => (
                    <NflDivisionTable key={division.division} division={division} />
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Classificação indisponível no momento.</p>
            )}
          </div>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>Fonte: ESPN.</p>
      </>
    );
  }

  async function NbaTab() {
    const [games, standings] = await Promise.all([getTodayGames(), getNbaStandingsByDivision()]);
    return (
      <>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>NBA</h1>
        </header>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Jogos de hoje</h2>
            {games && games.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
                {games.map((game) => (
                  <AmericanGameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Nenhum jogo hoje.</p>
            )}
          </div>
          <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>Classificação por divisão</h2>
            {standings && standings.length > 0 ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                  {standings.filter((d) => d.conference === "East").map((division) => (
                    <NbaDivisionTable key={division.division} division={division} />
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                  {standings.filter((d) => d.conference === "West").map((division) => (
                    <NbaDivisionTable key={division.division} division={division} />
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Classificação indisponível no momento.</p>
            )}
          </div>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>Fonte: ESPN.</p>
      </>
    );
  }
}
