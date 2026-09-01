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
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewsletterForm } from "@/components/NewsletterForm";
import { FormatTag } from "@/components/FormatTag";
import type { Article, Author } from "@/types/database.types";

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
  const [{ data: articlesData }, { data: authorsData }, { data: configData }] = await Promise.all([
    client.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false }),
    client.from("authors").select("*").eq("status", "active").order("order"),
    client.from("site_config").select("*"),
  ]);

  const allArticles = (articlesData ?? []) as Article[];
  const authors = (authorsData ?? []) as Author[];
  const config = Object.fromEntries(
    ((configData ?? []) as { key: string; value: string | null }[]).map((c) => [c.key, c.value ?? ""])
  );
  const featuredVideoUrl = config.featured_video_url;
  const isLive = config.is_live === "true" && Boolean(config.live_stream_url);
  const [featured, ...rest] = allArticles;
  const secondary = rest.slice(0, 3);

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

      {/* News lead — UOL-style front page block */}
      {featured && (
        <section style={{ backgroundColor: "white", paddingTop: "2.5rem", paddingBottom: "2.5rem" }}>
          <div className="container-xl">
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4361EE", letterSpacing: "0.08em", marginBottom: "1rem" }}>
              CONTEÚDO
            </div>

            <div className="home-lead-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2.5rem", alignItems: "start" }}>
              {/* Main column */}
              <div>
                <Link
                  href={{ pathname: "/mea-sententia/[slug]", params: { slug: featured.slug } }}
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <div style={{ marginBottom: "0.625rem" }}>
                    <FormatTag format={featured.format} />
                  </div>
                  <h1 style={{ fontWeight: 800, fontSize: "clamp(1.625rem, 3.5vw, 2.5rem)", color: "#0d1b2a", lineHeight: 1.15, marginBottom: "0.75rem" }}>
                    {featured.title_pt}
                  </h1>
                  {featured.excerpt_pt && (
                    <p style={{ color: "#64748b", fontSize: "1.0625rem", lineHeight: 1.6 }}>
                      {featured.excerpt_pt}
                    </p>
                  )}
                </Link>

                {secondary.length > 0 && (
                  <ul style={{ listStyle: "none", margin: "1.25rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {secondary.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                          style={{ display: "flex", alignItems: "baseline", gap: "0.625rem", textDecoration: "none", color: "#334155", fontSize: "0.9375rem", fontWeight: 500 }}
                        >
                          <span style={{ width: "0.4375rem", height: "0.4375rem", backgroundColor: "#4361EE", flexShrink: 0 }} />
                          {article.title_pt}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {secondary.length > 0 && (
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: "1.75rem", paddingTop: "1.75rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                    {secondary.map((article) => (
                      <Link
                        key={article.id}
                        href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                        style={{ display: "block", textDecoration: "none" }}
                      >
                        <div
                          style={{
                            height: "130px",
                            borderRadius: "0.625rem",
                            marginBottom: "0.625rem",
                            background: article.cover_image ? `url(${article.cover_image}) center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                          }}
                        />
                        <div style={{ marginBottom: "0.375rem" }}>
                          <FormatTag format={article.format} />
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0d1b2a", lineHeight: 1.4 }}>
                          {article.title_pt}
                        </h4>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside>
                {isLive && (
                  <div style={{ borderRadius: "0.75rem", overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", marginBottom: "1.25rem" }}>
                    <div style={{ backgroundColor: "#dc2626", color: "white", padding: "0.625rem 1rem", fontWeight: 800, fontSize: "0.8125rem", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="live-dot" style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", backgroundColor: "white", flexShrink: 0 }} />
                      AO VIVO
                    </div>
                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                      <iframe
                        src={config.live_stream_url}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                <div style={{ borderRadius: "0.75rem", overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
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
                    <div style={{ aspectRatio: "16/9", backgroundColor: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.875rem", fontWeight: 600 }}>
                      Em breve
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "1.25rem", borderRadius: "0.75rem", overflow: "hidden", background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", padding: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#FFB703", fontWeight: 800, fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
                    <Zap size={14} /> FLASH
                  </div>
                  <h4 style={{ color: "white", fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem" }}>
                    Receba a Mea Sententia por e-mail
                  </h4>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: "1rem" }}>
                    Perspectivas sobre Marketing, Growth e IA direto na sua caixa de entrada.
                  </p>
                  <NewsletterForm compact />
                </div>
              </aside>
            </div>
          </div>

          <style>{`
            @media (max-width: 900px) {
              .home-lead-grid { grid-template-columns: 1fr !important; }
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
        <section style={{ backgroundColor: "white", borderTop: "2px solid #4361EE", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="container-xl" style={{ display: "flex", justifyContent: "center", gap: "2rem", padding: "1.25rem 0", flexWrap: "wrap", overflowX: "auto" }}>
            {authors.map((author) => {
              const latest = latestByAuthor.get(author.id);
              return (
                <Link
                  key={author.id}
                  href={
                    latest
                      ? { pathname: "/mea-sententia/[slug]", params: { slug: latest.slug } }
                      : { pathname: "/mea-sententia/autor/[slug]", params: { slug: author.slug } }
                  }
                  style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", textDecoration: "none", width: "220px" }}
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
                        color: "#1e293b",
                        fontSize: "0.8125rem",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
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
                transition: "all 0.2s",
                boxShadow: "0 4px 24px -4px rgba(67,97,238,0.5)",
              }}
            >
              {t("ctaPrimary")} <ArrowRight size={18} />
            </Link>
            <Link
              href="/contato"
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
                transition: "all 0.2s",
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
        </div>
      </section>

      {/* Services */}
      <section className="section-padding" style={{ backgroundColor: "#f0f4f8" }}>
        <div className="container-xl">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800,
                color: "#0d1b2a",
                marginBottom: "0.75rem",
              }}
            >
              {t("servicesTitle")}
            </h2>
            <p style={{ color: "#64748b", fontSize: "1.0625rem", maxWidth: "540px", margin: "0 auto" }}>
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
                style={{
                  display: "block",
                  backgroundColor: "white",
                  borderRadius: "1rem",
                  padding: "1.75rem",
                  border: "1px solid rgba(0,0,0,0.06)",
                  transition: "all 0.2s",
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
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "#0d1b2a", marginBottom: "0.5rem" }}>
                  {title}
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  {description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
              Thiago Leal
            </div>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "1.25rem",
              }}
            >
              Estrategista em Marketing,
              <br />
              <span style={{ color: "#06D6A0" }}>Growth e IA.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "2rem", fontSize: "1.0625rem" }}>
              Mais de 7 anos ajudando empresas a crescerem com estratégia, dados e inteligência artificial. Criador da People & Growth e da Neuro Botics.
            </p>
            <Link
              href="/sobre"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#06D6A0",
                color: "#0d1b2a",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 700,
                fontSize: "0.9375rem",
              }}
            >
              Conhecer minha trajetória <ArrowRight size={18} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Crescimento sustentável", description: "Estratégias que geram resultados duradouros sem comprometer a cultura." },
              { label: "Decisões baseadas em dados", description: "BI, analytics e IA para embasar cada escolha estratégica." },
              { label: "Pessoas como diferencial", description: "Times engajados constroem negócios mais fortes e resilientes." },
              { label: "Uso estratégico da IA", description: "Automações e agentes inteligentes que ampliam a capacidade humana." },
            ].map(({ label, description }) => (
              <div
                key={label}
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
        </div>
      </section>

      {/* CTA Contact */}
      <section className="section-padding" style={{ backgroundColor: "#f0f4f8", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "640px", margin: "0 auto" }}>
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
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.75rem" }}>
            {t("contactTitle")}
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.0625rem", marginBottom: "2rem" }}>
            {t("contactSubtitle")}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/contato"
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
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "white",
                border: "1px solid rgba(0,0,0,0.1)",
                color: "#0d1b2a",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.9375rem",
              }}
            >
              Explorar conteúdo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
