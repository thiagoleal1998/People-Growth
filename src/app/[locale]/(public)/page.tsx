import { getTranslations } from "next-intl/server";
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
import { NewsletterForm } from "@/components/NewsletterForm";
import { FormatTag } from "@/components/FormatTag";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { MediaCarousel } from "@/components/MediaCarousel";
import { AdBanner } from "@/components/AdBanner";
import { Reveal } from "@/components/Reveal";
import { toYouTubeEmbedUrl, withAutoplay } from "@/lib/youtube";
import type { Article, Author, Testimonial, MediaItem } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
    color: "#4361EE",
  },
  {
    icon: TrendingUp,
    title: "Growth & Marketing Digital",
    description: "Estratégias de aquisição, ativação e retenção baseadas em dados e experimentação contínua.",
    href: "/servicos" as const,
    color: "#06D6A0",
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
    color: "#4361EE",
  },
  {
    icon: Users,
    title: "Treinamentos Corporativos",
    description: "Capacitação em Marketing, IA, OKR e 5W2H para times e líderes.",
    href: "/servicos" as const,
    color: "#06D6A0",
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

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: articlesData }, { data: authorsData }, { data: configData }, { data: testimonialsData }, { data: mediaData }] = await Promise.all([
    client.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false }),
    client.from("authors").select("*").eq("status", "active").order("order"),
    client.from("site_config").select("*"),
    client.from("testimonials").select("*").eq("status", "active").order("order"),
    client.from("media_items").select("*").order("order").limit(5),
  ]);

  const allArticles = (articlesData ?? []) as Article[];
  const authors = (authorsData ?? []) as Author[];
  const testimonials = (testimonialsData ?? []) as Testimonial[];
  const mediaItems = (mediaData ?? []) as MediaItem[];
  const config = Object.fromEntries(
    ((configData ?? []) as { key: string; value: string | null }[]).map((c) => [c.key, c.value ?? ""])
  );
  const featuredVideoUrl = config.featured_video_url ? toYouTubeEmbedUrl(config.featured_video_url) : "";
  const liveStreamUrl = config.live_stream_url ? toYouTubeEmbedUrl(config.live_stream_url) : "";
  const shortsVideoUrl = config.shorts_video_url ? toYouTubeEmbedUrl(config.shorts_video_url) : "";
  const isLive = config.is_live === "true" && Boolean(liveStreamUrl);
  const [featured, ...rest] = allArticles;
  const secondary = rest.slice(0, 3);
  // Deliberately uncapped: this sits next to a sidebar of fixed-height video
  // widgets. Capping it to "match" that height leaves dead whitespace once
  // there's more news than fits the cap, since the two columns grow in
  // fundamentally different units (video aspect ratio vs. text rows) — the
  // only stable option is to let this one run its natural length.
  const moreNews = rest.slice(3);

  const latestByAuthor = new Map<string, Article>();
  for (const a of allArticles) {
    if (a.author_id && !latestByAuthor.has(a.author_id)) latestByAuthor.set(a.author_id, a);
  }

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
          <span style={{ color: "#06D6A0", fontSize: "0.875rem", fontWeight: 700 }}>
            Agende uma conversa gratuita →
          </span>
        </div>
      </Link>

      <div className="container-xl" style={{ paddingTop: "1.25rem" }}>
        <AdBanner slotKey="home-top" />
      </div>

      {/* News lead — UOL-style front page block */}
      {featured && (
        <section style={{ backgroundColor: "var(--site-bg)", paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
          <div className="container-xl">
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4361EE", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              CONTEÚDO
            </div>

            <div className="home-lead-grid" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "1.5rem", alignItems: "start" }}>
              {/* Main column */}
              <div>
                <Link
                  href={{ pathname: "/mea-sententia/[slug]", params: { slug: featured.slug } }}
                  style={{ display: "flex", textDecoration: "none", gap: "1rem", alignItems: "flex-start" }}
                  className="home-featured-link"
                >
                  {featured.cover_image && (
                    <div
                      style={{
                        width: "200px",
                        height: "160px",
                        flexShrink: 0,
                        borderRadius: "0.375rem",
                        background: `url(${featured.cover_image}) center/cover`,
                      }}
                    />
                  )}
                  <div>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <FormatTag format={featured.format} />
                    </div>
                    <h1 style={{ fontWeight: 800, fontSize: "clamp(1.625rem, 3.5vw, 2.5rem)", color: "var(--site-text)", lineHeight: 1.1, marginBottom: "0.5rem" }}>
                      {featured.title_pt}
                    </h1>
                    {featured.excerpt_pt && (
                      <p style={{ color: "var(--site-muted)", fontSize: "1.0625rem", lineHeight: 1.5 }}>
                        {featured.excerpt_pt}
                      </p>
                    )}
                  </div>
                </Link>

                {secondary.length > 0 && (
                  <ul style={{ listStyle: "none", margin: "0.875rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "0.4375rem" }}>
                    {secondary.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                          style={{ display: "flex", alignItems: "baseline", gap: "0.625rem", textDecoration: "none", color: "var(--site-text-secondary)", fontSize: "0.9375rem", fontWeight: 500 }}
                        >
                          <span style={{ width: "0.4375rem", height: "0.4375rem", backgroundColor: "#4361EE", flexShrink: 0 }} />
                          {article.title_pt}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {secondary.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--site-border)", marginTop: "1.125rem", paddingTop: "1.125rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.125rem" }}>
                    {secondary.map((article) => (
                      <Link
                        key={article.id}
                        href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                        style={{ display: "block", textDecoration: "none" }}
                        className="hover-card"
                      >
                        <div
                          style={{
                            height: "110px",
                            borderRadius: "0.5rem",
                            marginBottom: "0.5rem",
                            background: article.cover_image ? `url(${article.cover_image}) center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                          }}
                        />
                        <div style={{ marginBottom: "0.375rem" }}>
                          <FormatTag format={article.format} />
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)", lineHeight: 1.4 }}>
                          {article.title_pt}
                        </h4>
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
                    border: "1px solid rgba(67,97,238,0.2)",
                    backgroundColor: "rgba(67,97,238,0.04)",
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
                        href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                        style={{
                          display: "flex",
                          gap: "1rem",
                          alignItems: "flex-start",
                          textDecoration: "none",
                          padding: "1rem 0",
                          borderTop: "1px solid var(--site-border)",
                        }}
                      >
                        {i % 2 === 0 && article.cover_image && (
                          <div
                            style={{
                              width: "110px",
                              height: "80px",
                              flexShrink: 0,
                              borderRadius: "0.375rem",
                              background: `url(${article.cover_image}) center/cover`,
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: "0.375rem" }}>
                            <FormatTag format={article.format} />
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
                            {article.title_pt}
                          </h4>
                          {i % 2 === 0 && article.excerpt_pt && (
                            <p style={{ color: "var(--site-muted)", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: "0.25rem" }}>
                              {article.excerpt_pt}
                            </p>
                          )}
                          <span style={{ fontSize: "0.75rem", color: "var(--site-faint)" }}>
                            {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {moreNews.length > 0 && (
                      <Link
                        href="/mea-sententia"
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
                {isLive && (
                  <div style={{ borderRadius: "0.5rem", overflow: "hidden", border: "2px solid #dc2626", marginBottom: "0.875rem" }}>
                    <div style={{ backgroundColor: "#dc2626", color: "white", padding: "0.5rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.03em" }}>
                        <Radio size={14} /> TRANSMISSÃO
                      </span>
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
                        AO VIVO
                      </span>
                    </div>
                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                      <iframe
                        src={withAutoplay(liveStreamUrl)}
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
                  <div style={{ backgroundColor: "#4361EE", color: "white", padding: "0.625rem 1rem", fontWeight: 800, fontSize: "0.8125rem", letterSpacing: "0.04em" }}>
                    VÍDEO EM DESTAQUE
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
      {authors.length > 0 && (
        <section style={{ backgroundColor: "var(--site-bg)", borderTop: "2px solid #4361EE", borderBottom: "1px solid var(--site-border)" }}>
          <div className="container-xl" style={{ display: "flex", justifyContent: "center", gap: "2rem", padding: "1.25rem 0", flexWrap: "wrap" }}>
            {authors.map((author) => {
              const latest = latestByAuthor.get(author.id);
              return (
                <Link
                  key={author.id}
                  href={{ pathname: "/mea-sententia/autor/[slug]", params: { slug: author.slug } }}
                  className="columnist-hover"
                  style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", textDecoration: "none", width: "260px" }}
                >
                  <div
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      borderRadius: "0.375rem",
                      flexShrink: 0,
                      background: author.photo_url ? `url(${author.photo_url}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.8125rem", color: "#4361EE", marginBottom: "0.25rem" }}>{author.name}</div>
                    <div
                      style={{
                        color: "var(--site-text-secondary)",
                        fontSize: "0.75rem",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {author.tagline_pt?.trim() || (latest ? latest.title_pt : author.role_pt)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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
              "radial-gradient(circle at 20% 50%, rgba(67,97,238,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(6,214,160,0.08) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        <div className="container-xl" style={{ position: "relative", zIndex: 1, paddingTop: "5rem", paddingBottom: "5rem" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(67,97,238,0.15)",
              border: "1px solid rgba(67,97,238,0.3)",
              borderRadius: "9999px",
              padding: "0.375rem 1rem",
              marginBottom: "2rem",
            }}
          >
            <Sparkles size={14} color="#06D6A0" />
            <span style={{ fontSize: "0.8125rem", color: "#06D6A0", fontWeight: 600 }}>
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
                background: "linear-gradient(135deg, #4361EE, #06D6A0)",
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
                backgroundColor: "#4361EE",
                color: "white",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.9375rem",
                boxShadow: "0 4px 24px -4px rgba(67,97,238,0.5)",
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

          {/* Stats */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
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
                    background: "linear-gradient(135deg, #4361EE, #06D6A0)",
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
          {authors.length > 0 && (
            <div
              style={{
                marginTop: "3rem",
                backgroundColor: "rgba(6,214,160,0.08)",
                border: "1px solid rgba(6,214,160,0.2)",
                borderRadius: "1.25rem",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#06D6A0", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>
                Quem está por trás da People &amp; Growth
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
                {authors.map((author) => (
                  <div key={author.id} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", maxWidth: "280px" }}>
                    <div
                      style={{
                        width: "3.25rem",
                        height: "3.25rem",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: author.photo_url ? `url(${author.photo_url}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
                      }}
                    />
                    <div>
                      <div style={{ color: "white", fontWeight: 800, fontSize: "0.9375rem" }}>{author.name}</div>
                      {author.role_pt && (
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem", lineHeight: 1.4, marginTop: "0.125rem" }}>
                          {author.role_pt}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
      {mediaItems.length > 0 && (
        <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
          <div className="container-xl">
            <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4361EE", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                  NA MÍDIA
                </div>
                <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 800, color: "var(--site-text)" }}>
                  Onde já falamos sobre People &amp; Growth
                </h2>
              </div>
              <Link
                href="/na-midia"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#4361EE", fontWeight: 700, fontSize: "0.9375rem", textDecoration: "none", whiteSpace: "nowrap" }}
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
      {testimonials.length > 0 && (
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
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <Reveal>
          <div>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "rgba(6,214,160,0.15)",
                color: "#06D6A0",
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
              <span style={{ color: "#06D6A0" }}>atento ao que move o mundo.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "2rem", fontSize: "1.0625rem" }}>
              Fundada por Thiago Leal, Gustavo Monken e Raul Salustiano, a People & Growth une estratégia de negócios, dados e inteligência artificial a uma cobertura independente dos temas sociais, políticos, econômicos e ambientais que impactam pessoas e empresas.
            </p>
            <Link
              href="/sobre"
              className="hover-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#06D6A0",
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
              background: "linear-gradient(135deg, #4361EE, #06D6A0)",
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
                backgroundColor: "#4361EE",
                color: "white",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.9375rem",
                boxShadow: "0 4px 24px -4px rgba(67,97,238,0.4)",
              }}
            >
              Agendar conversa <ArrowRight size={18} />
            </Link>
            <Link
              href="/mea-sententia"
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
