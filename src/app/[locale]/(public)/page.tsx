import { useTranslations } from "next-intl";
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

const recentArticles = [
  {
    title: "Como usar IA para acelerar sua estratégia de Growth",
    excerpt: "Descubra como ferramentas de IA estão transformando a forma como empresas escalam seus resultados.",
    category: "IA",
    date: "Jun 2025",
    slug: "ia-estrategia-growth",
    readTime: 8,
  },
  {
    title: "OKRs na prática: como definir metas que realmente funcionam",
    excerpt: "Um guia completo para implementar OKRs em empresas de qualquer tamanho com resultados mensuráveis.",
    category: "Estratégia",
    date: "Mai 2025",
    slug: "okrs-na-pratica",
    readTime: 6,
  },
  {
    title: "Neuromarketing: como o cérebro decide e o que isso muda no Marketing",
    excerpt: "A neurociência por trás das decisões de compra e como aplicar esses princípios nas suas campanhas.",
    category: "Marketing",
    date: "Abr 2025",
    slug: "neuromarketing-decisoes",
    readTime: 10,
  },
];

export default function HomePage() {
  const t = useTranslations("home");

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
      <section className="section-padding" style={{ backgroundColor: "white" }}>
        <div className="container-xl">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.75rem" }}>
            {recentArticles.map((article) => (
              <article
                key={article.slug}
                style={{
                  borderRadius: "1rem",
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.07)",
                  transition: "all 0.2s",
                }}
              >
                {/* Cover placeholder */}
                <div
                  style={{
                    height: "200px",
                    background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "rgba(67,97,238,0.2)",
                      color: "#4361EE",
                      padding: "0.375rem 0.875rem",
                      borderRadius: "9999px",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                    }}
                  >
                    {article.category}
                  </span>
                </div>

                <div style={{ padding: "1.5rem" }}>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: "1.0625rem",
                      color: "#0d1b2a",
                      lineHeight: 1.4,
                      marginBottom: "0.625rem",
                    }}
                  >
                    {article.title}
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                    {article.excerpt}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                      {article.date} · {article.readTime} min
                    </span>
                    <Link
                      href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                      style={{ fontSize: "0.875rem", color: "#4361EE", fontWeight: 600 }}
                    >
                      Ler →
                    </Link>
                  </div>
                </div>
              </article>
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
              Ler Mea Sententia
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
