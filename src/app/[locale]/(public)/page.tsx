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
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/types/database.types";

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

function formatArticleDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function HomePage() {
  const t = await getTranslations("home");

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(4);
  const recentArticles = (data ?? []) as Article[];
  const [featured, ...secondary] = recentArticles;

  return (
    <>
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
              Estratégia · Growth · IA · Inovação
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

      {/* Latest articles */}
      {featured && (
        <section className="section-padding" style={{ backgroundColor: "white" }}>
          <div className="container-xl">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "#0d1b2a" }}>
                {t("latestArticles")}
              </h2>
              <Link
                href="/mea-sententia"
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#4361EE", fontWeight: 600, fontSize: "0.9375rem" }}
              >
                {t("viewAll")} <ChevronRight size={16} />
              </Link>
            </div>

            {/* Featured article */}
            <Link
              href={{ pathname: "/mea-sententia/[slug]", params: { slug: featured.slug } }}
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr",
                gap: "2.5rem",
                alignItems: "center",
                marginBottom: "3rem",
                paddingBottom: "3rem",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
              className="home-featured-article"
            >
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "clamp(1.375rem, 3vw, 1.875rem)", color: "#0d1b2a", lineHeight: 1.25, marginBottom: "0.875rem" }}>
                  {featured.title_pt}
                </h3>
                {featured.excerpt_pt && (
                  <p style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>
                    {featured.excerpt_pt}
                  </p>
                )}
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                  {featured.published_at && formatArticleDate(featured.published_at)}
                  {featured.read_time ? ` · ${featured.read_time} min` : ""}
                </span>
              </div>
              <div
                style={{
                  height: "260px",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  background: featured.cover_image ? `url(${featured.cover_image}) center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                }}
              />
            </Link>

            {secondary.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.75rem" }}>
                {secondary.map((article) => (
                  <Link
                    key={article.id}
                    href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                    style={{ display: "block", textDecoration: "none" }}
                  >
                    <div
                      style={{
                        height: "160px",
                        borderRadius: "0.75rem",
                        marginBottom: "1rem",
                        background: article.cover_image ? `url(${article.cover_image}) center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                      }}
                    />
                    <h4 style={{ fontWeight: 700, fontSize: "1rem", color: "#0d1b2a", lineHeight: 1.4, marginBottom: "0.5rem" }}>
                      {article.title_pt}
                    </h4>
                    <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                      {article.published_at && formatArticleDate(article.published_at)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <style>{`
            @media (max-width: 768px) {
              .home-featured-article { grid-template-columns: 1fr !important; }
            }
          `}</style>
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
              Ler Mea Sententia
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
