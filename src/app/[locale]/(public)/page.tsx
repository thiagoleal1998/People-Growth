import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  TrendingUp,
  Brain,
  BarChart3,
  Users,
  Target,
  Sparkles,
  Zap,
  Radio,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFaqEntriesFromConfig } from "@/lib/faq";
import { pickLocale } from "@/lib/locale-content";
import { FaqAccordion } from "@/components/FaqAccordion";
import { NewsletterForm } from "@/components/NewsletterForm";
import { FormatTag } from "@/components/FormatTag";
import { PeopleGrowthBadge } from "@/components/PeopleGrowthBadge";
import { PontoDeReplicaBadge } from "@/components/PontoDeReplicaBadge";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { MediaCarousel } from "@/components/MediaCarousel";
import { AdBanner } from "@/components/AdBanner";
import { Reveal } from "@/components/Reveal";
import { VideoFacade } from "@/components/VideoFacade";
import { toYouTubeEmbedUrl, withAutoplay, getYouTubeThumbnail } from "@/lib/youtube";
import { getGovernorRace, getPresidentRace, getSenateRace } from "@/lib/tse";
import { ElectionResults } from "@/components/ElectionResults";
import { ElectionBanner } from "@/components/ElectionBanner";
import {
  COMPETITIONS,
  COMPETITION_ORDER,
  defaultWidgetTab,
  getBestStandings,
  getCurrentRoundFixtures,
  getLiveFixtures,
  getUpcomingRoundFixtures,
  isAnyCompetitionLiveNow,
  withReliableCrests,
  type Competition,
  type Fixture,
  type SportsWidgetTab,
  type StandingRow,
} from "@/lib/sports";
import { SportsLiveWidget } from "@/components/SportsLiveWidget";
import { ColumnistCarousel } from "@/components/ColumnistCarousel";
import { NflPreview } from "@/components/NflPreview";
import { NbaPreview } from "@/components/NbaPreview";
import { SportsStandingsSnippet } from "@/components/SportsStandingsSnippet";
import { articleHref } from "@/lib/article-url";
import { isAuthorPubliclyVisible } from "@/lib/founder-data";
import type { Article, Author, Testimonial, MediaItem, Category } from "@/types/database.types";

// Fisher-Yates — used so the home's columnist strip shows a different 4
// each time the page re-renders (this page's `revalidate = 300` means
// that's effectively a reshuffled set every 5 minutes, not every single
// visitor, which is the point: a cached page can't vary per request).
function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type ArticleWithCategory = Article & { categories: Pick<Category, "slug" | "is_people_growth" | "is_ponto_de_replica"> | null };

function FounderEntry({ author, locale }: { author: Author; locale: string }) {
  return (
    <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
      <div
        style={{
          width: "3.25rem",
          height: "3.25rem",
          borderRadius: "50%",
          flexShrink: 0,
          background: author.photo_url ? `url("${author.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
        }}
      />
      <div>
        <div style={{ color: "white", fontWeight: 800, fontSize: "0.9375rem" }}>{author.name}</div>
        {author.role_pt && (
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem", lineHeight: 1.4, marginTop: "0.125rem" }}>
            {pickLocale(locale, author.role_pt, author.role_en)}
          </div>
        )}
      </div>
    </div>
  );
}

const stats = [
  { labelKey: "statsYears", value: "7+" },
  { labelKey: "statsCerts", value: "20+" },
  { labelKey: "statsCompanies", value: "30+" },
  { labelKey: "statsArticles", value: "100+" },
  { labelKey: "statsStudents", value: "500+" },
];

const services = [
  {
    icon: Target,
    title: "Consultoria Estratégica",
    description: "Diagnóstico, planejamento e reestruturação para negócios que querem crescer com inteligência.",
    href: "/servicos" as const,
    color: "#315E9C",
  },
  {
    icon: TrendingUp,
    title: "Growth & Marketing Digital",
    description: "Estratégias de aquisição, ativação e retenção baseadas em dados e experimentação contínua.",
    href: "/servicos" as const,
    color: "#C89A4A",
  },
  {
    icon: BarChart3,
    title: "Business Intelligence",
    description: "Dashboards, KPIs e decisões orientadas por dados com Power BI e Looker Studio.",
    href: "/servicos" as const,
    color: "#FFB703",
  },
  {
    icon: Brain,
    title: "Inteligência Artificial",
    description: "Agentes GPT, automações com n8n/Make e soluções de IA aplicadas ao seu negócio.",
    href: "/laboratorio-ia" as const,
    color: "#315E9C",
  },
  {
    icon: Users,
    title: "Treinamentos Corporativos",
    description: "Capacitação em Marketing, IA, OKR e 5W2H para times e líderes.",
    href: "/servicos" as const,
    color: "#C89A4A",
  },
  {
    icon: Sparkles,
    title: "Mentoria",
    description: "Acompanhamento individual para profissionais que querem se posicionar como referência.",
    href: "/servicos" as const,
    color: "#FFB703",
  },
];

export const revalidate = 300;

export default async function HomePage() {
  const t = await getTranslations("home");
  const tNewsletter = await getTranslations("newsletter");
  const tc = await getTranslations("common");
  const tFaq = await getTranslations("faq");
  const locale = await getLocale();

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: articlesData }, { data: authorsData }, { data: configData }, { data: testimonialsData }, { data: mediaData }] = await Promise.all([
    // "categories!category_id" disambiguates the embed now that articles has a second
    // FK path to categories through the article_categories join table (multi-category).
    client.from("articles").select("*, categories!category_id(slug, is_people_growth, is_ponto_de_replica)").eq("status", "published").order("published_at", { ascending: false }),
    client.from("authors").select("*").eq("status", "active").order("order"),
    client.from("site_config").select("*"),
    client.from("testimonials").select("*").eq("status", "active").order("order"),
    client.from("media_items").select("*").order("order").limit(5),
  ]);

  const allArticles = (articlesData ?? []) as ArticleWithCategory[];
  const authors = (authorsData ?? []) as Author[];
  const authorById = new Map(authors.map((a) => [a.id, a]));
  // "Founders" sections (the hero's "Quem está por trás" box, and the
  // "fale direto com..." CTA) are specifically about the 3 founders, not
  // every active columnist — authors.is_founder distinguishes them.
  const founders = authors.filter((a) => a.is_founder);
  // The founders box is a 1-top-2-bottom pyramid (the CEO centered above
  // the other two, rather than a plain grid) — identified by role text
  // ("CEO") rather than name, so it keeps working if the CEO ever changes.
  // Only meaningful for exactly 3 founders; falls back to the plain grid
  // otherwise.
  const ceoFounder = founders.length === 3 ? (founders.find((a) => a.role_pt?.includes("CEO")) ?? null) : null;
  const otherFounders = ceoFounder ? founders.filter((a) => a.id !== ceoFounder.id) : [];
  // Shown in the white strip below — a different random 4 each time this
  // page reshuffles (see `shuffled` above), and only profiles finished
  // enough to actually show (photo + name + tagline).
  const completeColumnists = authors.filter(isAuthorPubliclyVisible);
  // One author's most recent published article, used as a blurb fallback
  // below when a profile has no tagline of its own — needed here (rather
  // than down where allArticles is otherwise consumed) because the
  // columnist strip's card data is built right after this.
  const latestArticleByAuthor = new Map<string, Article>();
  for (const a of allArticles) {
    if (a.author_id && !latestArticleByAuthor.has(a.author_id)) latestArticleByAuthor.set(a.author_id, a);
  }
  // Shuffled once per render (see `shuffled` above — effectively every 5min,
  // this page's revalidate window) rather than fixed to a random 4: the
  // strip is now a client-side carousel (ColumnistCarousel) that pages
  // through everyone instead of hard-capping at 4 with no way to see the
  // rest, so the full set is sent down, just in a different order each time.
  const columnistCards = shuffled(completeColumnists).map((author) => ({
    id: author.id,
    slug: author.slug,
    name: author.name,
    photoUrl: author.photo_url,
    blurb:
      pickLocale(locale, author.tagline_pt, author.tagline_en)?.trim() ||
      (() => {
        const latest = latestArticleByAuthor.get(author.id);
        return latest ? pickLocale(locale, latest.title_pt, latest.title_en) : pickLocale(locale, author.role_pt, author.role_en);
      })(),
  }));
  const founderFirstNames = founders.map((a) => a.name.split(" ")[0]);
  const founderNamesText =
    founderFirstNames.length > 1
      ? `${founderFirstNames.slice(0, -1).join(", ")} e ${founderFirstNames[founderFirstNames.length - 1]}`
      : (founderFirstNames[0] ?? "");
  const testimonials = (testimonialsData ?? []) as Testimonial[];
  const mediaItems = (mediaData ?? []) as MediaItem[];
  const config = Object.fromEntries(
    ((configData ?? []) as { key: string; value: string | null }[]).map((c) => [c.key, c.value ?? ""])
  );
  const heroVideoUrl = config.hero_video_url ? toYouTubeEmbedUrl(config.hero_video_url) : "";
  const heroVideoThumbnail = config.hero_video_url ? getYouTubeThumbnail(config.hero_video_url) : null;
  const featuredVideoUrl = config.featured_video_url ? toYouTubeEmbedUrl(config.featured_video_url) : "";
  const shortsVideoUrl = config.shorts_video_url ? toYouTubeEmbedUrl(config.shorts_video_url) : "";
  // The admin picks whether the box is labelled "Ao vivo" or "Replay"; the
  // video follows that choice, and the box shows only when is_live is on.
  // With no live link set there is nothing to play live, so the box falls back
  // to the replay and is labelled as one.
  const liveBoxIsReplay = config.live_box_type === "replay" || !config.live_stream_url;
  const liveBoxUrl = liveBoxIsReplay ? config.live_replay_url : config.live_stream_url;
  const showLiveBox = config.is_live === "true" && Boolean(liveBoxUrl);
  const isLive = !liveBoxIsReplay;
  const mediaEnabled = config.media_enabled !== "false";
  const testimonialsEnabled = config.testimonials_enabled !== "false";
  const electionsEnabled = config.tse_widget_enabled !== "false";
  const electionsInitial = electionsEnabled
    ? { uf: "sp", president: await getPresidentRace(), governor: await getGovernorRace("sp"), senate: await getSenateRace("sp") }
    : null;
  const sportsEnabled = config.sports_widget_enabled !== "false";
  // Standings: the full table, scraped from api-futebol.com.br's public
  // pages, falling back to TheSportsDB's top-5 if that ever breaks (see
  // getBestStandings in src/lib/sports.ts). Live scores: API-Football, which
  // can't do standings itself on the free plan (current season is blocked).
  //
  // The widget shows up to three tabs — Ao vivo (only when something's
  // actually live), Resultados da rodada, Próximos jogos — letting the
  // viewer switch freely instead of the page guessing a single state.
  // roundResults/roundUpcoming are each the CURRENT round's full list (not
  // time-windowed — a viewer who clicks a tab wants to see it, not a
  // decluttered slice of it); defaultWidgetTab picks a sensible starting
  // tab from that same data (today's own game beats an older result or a
  // later fixture; otherwise a still-fresh result or a fixture starting
  // soon; see sports.ts). getCurrentRoundFixtures/getUpcomingRoundFixtures
  // both read api-futebol.com.br's own "current round" page — the former
  // falls back to the previous round if the current one has no results yet
  // (so results doesn't show an empty round), the latter never does (so
  // upcoming always reflects the real next fixture, never a dead round).
  let sportsInitial: {
    standingsByCompetition: Partial<Record<Competition, StandingRow[] | null>>;
    live: Fixture[];
    roundResults: Fixture[];
    roundUpcoming: Fixture[];
    defaultTab: SportsWidgetTab;
  } | null = null;
  if (sportsEnabled) {
    // Every format:"table" competition, not just Série A — the home widget
    // now has its own tabs (SportsStandingsSnippet) so a viewer can flip
    // between leagues instead of only ever seeing Série A. Knockout-only
    // competitions (copa_do_brasil/libertadores/sulamericana) have no table
    // to show here. fetchScrapedHtml caches each page independently, so this
    // costs nothing extra beyond the first render in a cache window.
    const tableCompetitions = COMPETITION_ORDER.filter((c) => COMPETITIONS[c].format === "table");
    const standingsEntries = await Promise.all(tableCompetitions.map(async (c) => [c, await getBestStandings(c)] as const));
    const standingsByCompetition = Object.fromEntries(standingsEntries) as Partial<Record<Competition, StandingRow[] | null>>;
    // live carries API-Football's own crest urls (media.api-sports.io) —
    // withReliableCrests swaps those for the scraped standings' equivalent
    // (a different, confirmed-working domain) wherever a match exists,
    // before any of this ever reaches the page. roundResults/roundUpcoming
    // are already scraped-sourced and don't need it.
    const live = withReliableCrests((await isAnyCompetitionLiveNow()) ? ((await getLiveFixtures()) ?? []) : [], standingsByCompetition.serie_a ?? null);

    // Every tracked competition feeds "Resultados"/"Próximos jogos", not just
    // Série A — a Sul-Americana or Libertadores match starting soon is just
    // as much "today's game" as a Brasileirão one. fetchScrapedHtml caches
    // each competition's page independently, so fetching all five here costs
    // nothing extra beyond the first render in a cache window.
    const rawRoundFixturesByCompetition = await Promise.all(COMPETITION_ORDER.map((c) => getCurrentRoundFixtures(c)));
    const roundResults = rawRoundFixturesByCompetition.flatMap((fixtures) => fixtures ?? []).filter((f) => f.status === "finished");
    const roundUpcomingByCompetition = await Promise.all(COMPETITION_ORDER.map((c) => getUpcomingRoundFixtures(c)));
    const roundUpcoming = roundUpcomingByCompetition.flatMap((fixtures) => fixtures ?? []).sort((a, b) => a.date.localeCompare(b.date));

    sportsInitial = {
      standingsByCompetition,
      live,
      roundResults,
      roundUpcoming,
      defaultTab: defaultWidgetTab(live.length > 0, roundResults, roundUpcoming),
    };
  }
  const faqEntries = getFaqEntriesFromConfig(config, locale);
  // Articles are ordered by publication date, except where an admin pinned one
  // to a home slot: that one takes its slot regardless of date. Editing an
  // article never changes its date, so it only moves when it is pinned.
  const pinnedPrincipal = allArticles.find((a) => a.home_slot === "principal");
  const pinnedSecondary = [1, 2, 3].map((n) => allArticles.find((a) => a.home_slot === `secundario_${n}`));
  const unpinned = allArticles.filter((a) => !a.home_slot);
  const featured = pinnedPrincipal ?? unpinned[0];
  const queue = unpinned.filter((a) => a.id !== featured?.id);
  const secondary: ArticleWithCategory[] = [];
  for (let i = 0; i < 3; i++) {
    const pinned = pinnedSecondary[i];
    if (pinned) secondary.push(pinned);
    else {
      const next = queue.shift();
      if (next) secondary.push(next);
    }
  }
  // Deliberately uncapped: this sits next to a sidebar of fixed-height video
  // widgets. Capping it to "match" that height leaves dead whitespace once
  // there's more news than fits the cap, since the two columns grow in
  // fundamentally different units (video aspect ratio vs. text rows) — the
  // only stable option is to let this one run its natural length.
  const moreNews = queue;

  return (
    <>
      {/* Self-promo banner (in place of an ad slot) */}
      <Link
        href="/contato"
        style={{
          display: "block",
          backgroundColor: "#0d1b2a",
          textDecoration: "none",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="container-xl"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", padding: "0.75rem 0", flexWrap: "wrap", textAlign: "center" }}
        >
          <span style={{ color: "white", fontSize: "0.875rem", fontWeight: 600 }}>
            🚀 Pronto para acelerar o crescimento do seu negócio com estratégia, dados e IA?
          </span>
          <span style={{ color: "#C89A4A", fontSize: "0.875rem", fontWeight: 700 }}>
            Agende uma conversa gratuita →
          </span>
        </div>
      </Link>

      <div className="container-xl" style={{ paddingTop: "1.25rem" }}>
        <AdBanner slotKey="home-top" />
      </div>

      {electionsInitial && (
        <div className="container-xl" style={{ maxWidth: "1180px", margin: "0 auto", paddingTop: "1.5rem" }}>
          <ElectionResults initial={electionsInitial} locale={locale} />
          {electionsInitial.president && (
            <div style={{ marginTop: "2rem" }}>
              <ElectionBanner president={electionsInitial.president} locale={locale} />
            </div>
          )}
        </div>
      )}

      {sportsInitial && (
        <div className="container-xl" style={{ maxWidth: "1180px", margin: "0 auto", paddingTop: "1.5rem" }}>
          <section style={{ borderTop: "3px solid #315E9C", paddingTop: "1.25rem", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
            <SportsLiveWidget
              initial={sportsInitial.live}
              roundResults={sportsInitial.roundResults}
              roundUpcoming={sportsInitial.roundUpcoming}
              defaultTab={sportsInitial.defaultTab}
              locale={locale}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <Link href="/esportes" style={{ color: "#315E9C", fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600 }}>
                {locale === "en" ? "See all competitions ›" : "Ver todas as competições ›"}
              </Link>
            </div>
          </section>
        </div>
      )}

      {/* News lead — UOL-style front page block */}
      {featured && (
        <section style={{ backgroundColor: "var(--site-bg)", paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
          <div className="container-xl">
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#315E9C", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              {tNewsletter("heroBadge")}
            </div>

            <div className="home-lead-grid" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "1.5rem", alignItems: "start" }}>
              {/* Main column */}
              <div>
                <Link
                  href={articleHref(featured, featured.categories?.slug)}
                  style={{ display: "flex", textDecoration: "none", gap: "1rem", alignItems: "flex-start" }}
                  className="home-featured-link"
                >
                  <div
                    style={{
                      width: "200px",
                      height: "160px",
                      flexShrink: 0,
                      borderRadius: "0.375rem",
                      background: featured.cover_image ? `url("${featured.cover_image}") center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                    }}
                  />
                  <div>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <FormatTag format={featured.format} locale={locale} />
                      {featured.categories?.is_people_growth && <PeopleGrowthBadge />}
                      {featured.categories?.is_ponto_de_replica && <PontoDeReplicaBadge />}
                    </div>
                    <h1 style={{ fontWeight: 800, fontSize: "clamp(1.625rem, 3.5vw, 2.5rem)", color: "var(--site-text)", lineHeight: 1.1, marginBottom: "0.5rem" }}>
                      {pickLocale(locale, featured.title_pt, featured.title_en)}
                    </h1>
                    {featured.excerpt_pt && (
                      <p style={{ color: "var(--site-muted)", fontSize: "1.0625rem", lineHeight: 1.5 }}>
                        {pickLocale(locale, featured.excerpt_pt, featured.excerpt_en)}
                      </p>
                    )}
                    {featured.author_id && authorById.get(featured.author_id) && (
                      <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--site-faint)" }}>
                        {tc("by")} {authorById.get(featured.author_id)!.name}
                      </span>
                    )}
                  </div>
                </Link>

                {secondary.length > 0 && (
                  <ul style={{ listStyle: "none", margin: "0.875rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "0.4375rem" }}>
                    {secondary.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={articleHref(article, article.categories?.slug)}
                          style={{ display: "flex", alignItems: "baseline", gap: "0.625rem", textDecoration: "none", color: "var(--site-text-secondary)", fontSize: "0.9375rem", fontWeight: 500 }}
                        >
                          <span style={{ width: "0.4375rem", height: "0.4375rem", backgroundColor: "#315E9C", flexShrink: 0 }} />
                          {pickLocale(locale, article.title_pt, article.title_en)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {secondary.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--site-border)", marginTop: "1.125rem", paddingTop: "1.125rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "1.125rem" }}>
                    {secondary.map((article) => (
                      <Link
                        key={article.id}
                        href={articleHref(article, article.categories?.slug)}
                        style={{ display: "block", textDecoration: "none" }}
                        className="hover-card"
                      >
                        <div
                          style={{
                            height: "110px",
                            borderRadius: "0.5rem",
                            marginBottom: "0.5rem",
                            background: article.cover_image ? `url("${article.cover_image}") center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                          }}
                        />
                        <div style={{ marginBottom: "0.375rem" }}>
                          <FormatTag format={article.format} locale={locale} />
                          {article.categories?.is_people_growth && <PeopleGrowthBadge />}
                          {article.categories?.is_ponto_de_replica && <PontoDeReplicaBadge />}
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)", lineHeight: 1.4 }}>
                          {pickLocale(locale, article.title_pt, article.title_en)}
                        </h4>
                        {article.author_id && authorById.get(article.author_id) && (
                          <span style={{ display: "block", marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--site-faint)" }}>
                            {tc("by")} {authorById.get(article.author_id)!.name}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Newsletter signup */}
                <div
                  style={{
                    marginTop: "1.75rem",
                    padding: "1.5rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(49, 94, 156,0.2)",
                    backgroundColor: "rgba(49, 94, 156,0.04)",
                  }}
                >
                  <h4 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--site-text)", marginBottom: "0.375rem" }}>
                    ✍️ Receba a Mea Sententia por e-mail
                  </h4>
                  <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "1rem" }}>
                    Perspectivas sobre negócios, sociedade e os temas que impactam pessoas — direto na sua caixa de entrada.
                  </p>
                  <NewsletterForm light />
                </div>

                {/* More news, alternating formats */}
                {moreNews.length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <h2 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--site-muted)", marginTop: "1.5rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Mais notícias
                    </h2>
                    {moreNews.map((article, i) => (
                      <Link
                        key={article.id}
                        href={articleHref(article, article.categories?.slug)}
                        className="more-news-row"
                        style={{
                          display: "flex",
                          gap: "1rem",
                          alignItems: "flex-start",
                          textDecoration: "none",
                          padding: "1rem 0",
                          borderTop: "1px solid var(--site-border)",
                        }}
                      >
                        {article.cover_image && (
                          <div
                            className="more-news-img"
                            style={{
                              width: "110px",
                              height: "80px",
                              flexShrink: 0,
                              borderRadius: "0.375rem",
                              background: `url("${article.cover_image}") center/cover`,
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: "0.375rem" }}>
                            <FormatTag format={article.format} locale={locale} />
                            {article.categories?.is_people_growth && <PeopleGrowthBadge />}
                            {article.categories?.is_ponto_de_replica && <PontoDeReplicaBadge />}
                          </div>
                          <h4
                            style={{
                              fontWeight: 700,
                              fontSize: i % 2 === 0 ? "1rem" : "0.9375rem",
                              color: "var(--site-text)",
                              lineHeight: 1.35,
                              marginBottom: "0.25rem",
                            }}
                          >
                            {pickLocale(locale, article.title_pt, article.title_en)}
                          </h4>
                          {i % 2 === 0 && article.excerpt_pt && (
                            <p style={{ color: "var(--site-muted)", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: "0.25rem" }}>
                              {pickLocale(locale, article.excerpt_pt, article.excerpt_en)}
                            </p>
                          )}
                          <span style={{ fontSize: "0.75rem", color: "var(--site-faint)" }}>
                            {article.author_id && authorById.get(article.author_id) && <>{tc("by")} {authorById.get(article.author_id)!.name} · </>}
                            {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {moreNews.length > 0 && (
                      <Link
                        href="/conteudo"
                        className="hover-cta"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          marginTop: "1rem",
                          padding: "0.75rem",
                          borderRadius: "0.625rem",
                          border: "1px solid var(--site-border-strong)",
                          color: "var(--site-text)",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          textDecoration: "none",
                        }}
                      >
                        Ver todas as notícias <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside>
                {showLiveBox && (
                  <div style={{ borderRadius: "0.5rem", overflow: "hidden", border: `2px solid ${isLive ? "#dc2626" : "#315E9C"}`, marginBottom: "0.875rem" }}>
                    <div style={{ backgroundColor: isLive ? "#dc2626" : "#315E9C", color: "white", padding: "0.5rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.03em" }}>
                        <Radio size={14} /> {isLive ? t("liveBroadcast") : "Replay"}
                      </span>
                      {isLive && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3125rem",
                            backgroundColor: "white",
                            color: "#dc2626",
                            padding: "0.1875rem 0.5rem",
                            borderRadius: "9999px",
                            fontWeight: 800,
                            fontSize: "0.6875rem",
                            letterSpacing: "0.03em",
                          }}
                        >
                          <span className="live-dot" style={{ width: "0.4375rem", height: "0.4375rem", borderRadius: "50%", backgroundColor: "#dc2626", flexShrink: 0 }} />
                          {t("liveNow")}
                        </span>
                      )}
                    </div>
                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                      <iframe
                        src={withAutoplay(toYouTubeEmbedUrl(liveBoxUrl), { muted: true })}
                        title={isLive ? t("liveBroadcast") : "Replay"}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {config.live_caption_pt && (
                      <div style={{ padding: "0.75rem 0.875rem", borderTop: "2px solid #dc2626" }}>
                        <p style={{ color: "var(--site-text)", fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.4 }}>
                          {config.live_caption_pt}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ borderRadius: "0.75rem", overflow: "hidden", border: "1px solid var(--site-border)" }}>
                  <div style={{ backgroundColor: "#315E9C", color: "white", padding: "0.625rem 1rem", fontWeight: 800, fontSize: "0.8125rem", letterSpacing: "0.04em" }}>
                    {t("featuredVideo")}
                  </div>
                  {featuredVideoUrl ? (
                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                      <iframe
                        src={featuredVideoUrl}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div style={{ aspectRatio: "16/9", backgroundColor: "var(--site-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--site-faint)", fontSize: "0.875rem", fontWeight: 600 }}>
                      Em breve
                    </div>
                  )}
                </div>

                {sportsInitial && (
                  <div style={{ marginTop: "0.875rem", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid var(--site-border)" }}>
                    <SportsStandingsSnippet standingsByCompetition={sportsInitial.standingsByCompetition} locale={locale} />
                  </div>
                )}

                <div style={{ marginTop: "0.875rem", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid var(--site-border)" }}>
                  <div style={{ backgroundColor: "var(--site-card)", padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Zap size={16} color="#dc2626" fill="#dc2626" />
                    <span style={{ color: "#dc2626", fontWeight: 800, fontSize: "0.9375rem", letterSpacing: "0.02em" }}>SHORTS</span>
                  </div>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "9/16", backgroundColor: "#000" }}>
                    {shortsVideoUrl ? (
                      <iframe
                        src={shortsVideoUrl}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          textAlign: "center",
                          padding: "1rem",
                        }}
                      >
                        Em breve
                      </div>
                    )}
                  </div>
                </div>

              </aside>
            </div>
          </div>

          <style>{`
            @media (max-width: 900px) {
              .home-lead-grid { grid-template-columns: 1fr !important; }
            }
            @media (max-width: 560px) {
              .home-featured-link { flex-direction: column; }
              .home-featured-link > div:first-child { width: 100% !important; height: 200px !important; }
              /* Phones: photo on top, title and excerpt underneath. */
              .more-news-row { flex-direction: column !important; gap: 0.75rem !important; }
              .more-news-img { width: 100% !important; height: 180px !important; }
            }
            .live-dot { animation: live-pulse 1.4s ease-in-out infinite; }
            @keyframes live-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.25; }
            }
          `}</style>
        </section>
      )}

      {/* Columnists strip */}
      {columnistCards.length > 0 && (
        <section className="columnist-section" style={{ backgroundColor: "var(--site-bg)", borderTop: "2px solid #315E9C", borderBottom: "1px solid var(--site-border)" }}>
          <div className="container-xl" style={{ padding: "1.25rem 0", maxWidth: "1180px", margin: "0 auto" }}>
          <ColumnistCarousel cards={columnistCards} />
          {completeColumnists.length > 4 && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link href="/conteudo/colunistas" style={{ color: "#315E9C", fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none" }}>
                {tc("seeAll")} →
              </Link>
            </div>
          )}
          </div>
          {/* Phones get a horizontal swipe row of tall cards instead of a
              stacked list of small rows — the photo becomes the card. */}
          <style>{`
            @media (max-width: 768px) { .columnist-section { overflow-x: hidden; } }
            .columnist-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
              gap: 1.5rem 2rem;
            }
            @media (max-width: 768px) {
              .columnist-grid {
                display: flex;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                scroll-padding-left: 1.5rem;
                gap: 1.5rem;
                margin: 0 -1rem;
                padding: 0 1.5rem 0.5rem;
                scrollbar-width: none;
              }
              .columnist-grid::-webkit-scrollbar { display: none; }
              .columnist-card {
                flex: 0 0 38%;
                flex-direction: column !important;
                gap: 0.625rem !important;
                scroll-snap-align: start;
              }
              .columnist-photo {
                width: 100% !important;
                height: auto !important;
                aspect-ratio: 1 / 1;
                border-radius: 0.75rem !important;
              }
              .columnist-text { width: 100%; }
            }
          `}</style>
        </section>
      )}

      <NflPreview />
      <NbaPreview />

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #162236 50%, #1a1f3e 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid decoration */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(49, 94, 156,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(200, 154, 74,0.08) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        <div className="container-xl" style={{ position: "relative", zIndex: 1, paddingTop: "5rem", paddingBottom: "5rem" }}>
          <div className={heroVideoUrl ? "hero-grid" : undefined} style={heroVideoUrl ? { display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "3rem", alignItems: "center" } : undefined}>
          <div>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(49, 94, 156,0.15)",
              border: "1px solid rgba(49, 94, 156,0.3)",
              borderRadius: "9999px",
              padding: "0.375rem 1rem",
              marginBottom: "2rem",
            }}
          >
            <Sparkles size={14} color="#C89A4A" />
            <span style={{ fontSize: "0.8125rem", color: "#C89A4A", fontWeight: 600 }}>
              Negócios · Pessoas · Sociedade · IA
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
              maxWidth: "800px",
            }}
          >
            {t("heroTagline")}
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #315E9C, #C89A4A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              com propósito.
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              maxWidth: "600px",
              marginBottom: "2.5rem",
            }}
          >
            {t("heroSubtitle")}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/sobre"
              className="hover-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#315E9C",
                color: "white",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.9375rem",
                boxShadow: "0 4px 24px -4px rgba(49, 94, 156,0.5)",
              }}
            >
              {t("ctaPrimary")} <ArrowRight size={18} />
            </Link>
            <Link
              href="/contato"
              className="hover-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.9375rem",
              }}
            >
              {t("ctaSecondary")}
            </Link>
          </div>
          </div>

          {heroVideoUrl && (
            <div
              style={{
                position: "relative",
                paddingTop: "56.25%",
                borderRadius: "1.25rem",
                overflow: "hidden",
                boxShadow: "0 24px 60px -12px rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <VideoFacade embedUrl={heroVideoUrl} thumbnailUrl={heroVideoThumbnail} title="Vídeo institucional Festina" />
            </div>
          )}
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "2.5rem",
              marginTop: "4rem",
              paddingTop: "3rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {stats.map(({ labelKey, value }) => (
              <div key={labelKey}>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #315E9C, #C89A4A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                    marginBottom: "0.25rem",
                  }}
                >
                  {value}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                  {t(labelKey as keyof typeof t)}
                </div>
              </div>
            ))}
          </div>

          {/* Founders */}
          {founders.length > 0 && (
            <div
              style={{
                marginTop: "3rem",
                backgroundColor: "rgba(200, 154, 74,0.08)",
                border: "1px solid rgba(200, 154, 74,0.2)",
                borderRadius: "1.25rem",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#C89A4A", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>
                Quem está por trás do Grupo Festina
              </div>
              {ceoFounder && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                  {/* Matches the bottom row's own column width (same
                      minmax(min(240px, 100%), 1fr) math as the grid below,
                      via flex-basis since this is a 1-item row) — same size
                      as the other two, just centered on its own line above
                      them. */}
                  <div style={{ flex: "0 1 calc(50% - 1rem)", minWidth: "min(240px, 100%)" }}>
                    <FounderEntry author={ceoFounder} locale={locale} />
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "2rem" }}>
                {(ceoFounder ? otherFounders : founders).map((author) => (
                  <FounderEntry key={author.id} author={author} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </div>

        {heroVideoUrl && (
          <style>{`
            @media (max-width: 860px) {
              .hero-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        )}
      </section>

      {/* Services */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl">
          <Reveal>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800,
                color: "var(--site-text)",
                marginBottom: "0.75rem",
              }}
            >
              {t("servicesTitle")}
            </h2>
            <p style={{ color: "var(--site-muted)", fontSize: "1.0625rem", maxWidth: "540px", margin: "0 auto" }}>
              {t("servicesSubtitle")}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              gap: "1.5rem",
            }}
          >
            {services.map(({ icon: Icon, title, description, href, color }) => (
              <Link
                key={title}
                href={href}
                className="hover-card"
                style={{
                  display: "block",
                  backgroundColor: "var(--site-card)",
                  borderRadius: "1rem",
                  padding: "1.75rem",
                  border: "1px solid var(--site-border)",
                  textDecoration: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    backgroundColor: `${color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", marginBottom: "0.5rem" }}>
                  {title}
                </h3>
                <p style={{ color: "var(--site-muted)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  {description}
                </p>
              </Link>
            ))}
          </div>
          </Reveal>
        </div>
      </section>

      {/* Na Mídia */}
      {mediaEnabled && mediaItems.length > 0 && (
        <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
          <div className="container-xl">
            <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#315E9C", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                  NA MÍDIA
                </div>
                <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 800, color: "var(--site-text)" }}>
                  Onde já falamos sobre o Grupo Festina
                </h2>
              </div>
              <Link
                href="/na-midia"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#315E9C", fontWeight: 700, fontSize: "0.9375rem", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                Ver todas as menções <ArrowRight size={16} />
              </Link>
            </div>

            <MediaCarousel items={mediaItems} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonialsEnabled && testimonials.length > 0 && (
        <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
          <div className="container-xl">
            <Reveal>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  color: "var(--site-text)",
                  marginBottom: "0.75rem",
                }}
              >
                {t("testimonialsTitle")}
              </h2>
            </div>

            <TestimonialsCarousel testimonials={testimonials} />
            </Reveal>
          </div>
        </section>
      )}

      {/* About teaser */}
      <section
        className="section-padding"
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #162236 100%)",
          color: "white",
        }}
      >
        <div
          className="container-xl"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <Reveal>
          <div>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "rgba(200, 154, 74,0.15)",
                color: "#C89A4A",
                padding: "0.25rem 0.875rem",
                borderRadius: "9999px",
                fontSize: "0.8125rem",
                fontWeight: 600,
                marginBottom: "1.5rem",
              }}
            >
              Quem somos
            </div>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "1.25rem",
              }}
            >
              Estratégia, dados e um olhar
              <br />
              <span style={{ color: "#C89A4A" }}>atento ao que move o mundo.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "2rem", fontSize: "1.0625rem" }}>
              Fundado por Thiago Leal, Gustavo Monken e Raul Salustiano, o Grupo Festina une estratégia de negócios, dados e inteligência artificial a uma cobertura independente dos temas sociais, políticos, econômicos e ambientais que impactam pessoas e empresas.
            </p>
            <Link
              href="/sobre"
              className="hover-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#C89A4A",
                color: "var(--site-text)",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 700,
                fontSize: "0.9375rem",
              }}
            >
              Conhecer o time <ArrowRight size={18} />
            </Link>
          </div>
          </Reveal>

          <Reveal delay={150}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Crescimento sustentável", description: "Estratégias que geram resultados duradouros sem comprometer a cultura." },
              { label: "Decisões baseadas em dados", description: "BI, analytics e IA para embasar cada escolha estratégica." },
              { label: "Pessoas como diferencial", description: "Times engajados constroem negócios mais fortes e resilientes." },
              { label: "Uso estratégico da IA", description: "Automações e agentes inteligentes que ampliam a capacidade humana." },
            ].map(({ label, description }) => (
              <div
                key={label}
                className="hover-card-dark"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.75rem",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <div style={{ fontWeight: 700, color: "white", marginBottom: "0.25rem", fontSize: "0.9375rem" }}>
                  {label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                  {description}
                </div>
              </div>
            ))}
          </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Contact */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <Reveal>
          <div
            style={{
              width: "4rem",
              height: "4rem",
              borderRadius: "1rem",
              background: "linear-gradient(135deg, #315E9C, #C89A4A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <Sparkles size={24} color="white" />
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
            {t("contactTitle")}
          </h2>
          <p style={{ color: "var(--site-muted)", fontSize: "1.0625rem", marginBottom: "2rem" }}>
            {t("contactSubtitle")}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/contato"
              className="hover-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#315E9C",
                color: "white",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.9375rem",
                boxShadow: "0 4px 24px -4px rgba(49, 94, 156,0.4)",
              }}
            >
              Agendar conversa <ArrowRight size={18} />
            </Link>
            <Link
              href="/conteudo"
              className="hover-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "var(--site-card)",
                border: "1px solid var(--site-border-strong)",
                color: "var(--site-text)",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.9375rem",
              }}
            >
              Explorar conteúdo
            </Link>
          </div>

          {founders.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginTop: "2.5rem" }}>
              <div style={{ display: "flex" }}>
                {founders.slice(0, 4).map((author, i) => (
                  <div
                    key={author.id}
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "50%",
                      border: "2px solid var(--site-surface-alt)",
                      marginLeft: i === 0 ? 0 : "-0.625rem",
                      flexShrink: 0,
                      background: author.photo_url ? `url("${author.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: "0.875rem", color: "var(--site-muted)", textAlign: "left" }}>
                Fale direto com {founderNamesText} — sem intermediários.
              </span>
            </div>
          )}
          </Reveal>
        </div>
      </section>

      {/* FAQ — same admin-editable text (Admin > SEO > AEO) that feeds the
          invisible FAQPage schema; shown here so it's actually visible too. */}
      {faqEntries.length > 0 && (
        <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
          <div className="container-xl" style={{ maxWidth: "760px", margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
                  {tFaq("title")}
                </h2>
                <p style={{ color: "var(--site-muted)", fontSize: "1.0625rem" }}>{tFaq("subtitle")}</p>
              </div>
              <FaqAccordion entries={faqEntries} />
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <Link href="/faq" style={{ color: "#315E9C", fontWeight: 700, fontSize: "0.9375rem", textDecoration: "none" }}>
                  Ver todas as perguntas →
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
