import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  return { title: t("title"), description: t("subtitle") };
}

const cases = [
  {
    slug: "rebranding-e-crescimento-digital",
    category: "marketing",
    categoryLabel: "Marketing",
    title: "Rebranding e crescimento 3x em tráfego orgânico",
    description: "Reestruturação completa da identidade digital de uma empresa B2B, resultando em triplicação do tráfego orgânico em 6 meses.",
    tools: ["SEO", "Content Marketing", "Google Analytics 4", "Figma"],
    result: "+320% tráfego orgânico",
    resultColor: "#4361EE",
  },
  {
    slug: "funil-de-growth-e-reducao-de-cac",
    category: "growth",
    categoryLabel: "Growth",
    title: "Funil de growth com 35% de redução no CAC",
    description: "Mapeamento e otimização do funil de aquisição de uma SaaS B2B, com redução significativa do custo de aquisição.",
    tools: ["HubSpot", "Google Ads", "A/B Testing", "Analytics"],
    result: "-35% no CAC",
    resultColor: "#06D6A0",
  },
  {
    slug: "dashboard-executivo-bi",
    category: "data",
    categoryLabel: "Dados",
    title: "Dashboard executivo com Power BI para rede de franquias",
    description: "Criação de painel centralizado com KPIs operacionais, financeiros e de marketing para rede com 20 unidades.",
    tools: ["Power BI", "SQL", "Google Sheets", "Looker Studio"],
    result: "20 unidades monitoradas",
    resultColor: "#FFB703",
  },
  {
    slug: "agentes-ia-marketing",
    category: "ai",
    categoryLabel: "IA",
    title: "Agentes GPT para automação de marketing e vendas",
    description: "Desenvolvimento de agentes de IA integrados ao CRM e ferramentas de marketing, automatizando qualificação de leads e follow-up.",
    tools: ["GPT-4", "n8n", "HubSpot", "Make"],
    result: "60% menos tempo em tarefas manuais",
    resultColor: "#4361EE",
  },
  {
    slug: "reestruturacao-estrategica",
    category: "consulting",
    categoryLabel: "Consultoria",
    title: "Reestruturação estratégica e recuperação de margem",
    description: "Diagnóstico e plano estratégico para empresa em dificuldade, com foco em rentabilidade e posicionamento competitivo.",
    tools: ["Análise SWOT", "OKR", "5W2H", "BI"],
    result: "+28% na margem EBITDA",
    resultColor: "#06D6A0",
  },
  {
    slug: "treinamento-ia-time-marketing",
    category: "ai",
    categoryLabel: "IA",
    title: "Treinamento de IA para time de marketing de 25 pessoas",
    description: "Programa de capacitação em IA generativa para time de marketing, com trilha prática e casos de uso reais.",
    tools: ["ChatGPT", "Midjourney", "Make", "Notion AI"],
    result: "25 profissionais capacitados",
    resultColor: "#FFB703",
  },
];

const categories = [
  { key: "all", label: "Todos" },
  { key: "marketing", label: "Marketing" },
  { key: "growth", label: "Growth" },
  { key: "data", label: "Dados" },
  { key: "ai", label: "IA" },
  { key: "consulting", label: "Consultoria" },
];

export default async function PortfolioPage() {
  const t = await getTranslations("portfolio");

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "5rem", color: "white", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, marginBottom: "1rem" }}>{t("title")}</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>{t("subtitle")}</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "#f0f4f8" }}>
        <div className="container-xl">
          {/* Filter tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.5rem", justifyContent: "center" }}>
            {categories.map(({ key, label }) => (
              <button
                key={key}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "9999px",
                  border: "1px solid",
                  borderColor: key === "all" ? "#4361EE" : "#e2e8f0",
                  backgroundColor: key === "all" ? "#4361EE" : "white",
                  color: key === "all" ? "white" : "#475569",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
            {cases.map(({ slug, categoryLabel, title, description, tools, result, resultColor }) => (
              <Link
                key={slug}
                href={{ pathname: "/portfolio/[slug]", params: { slug } }}
                style={{ display: "block", textDecoration: "none" }}
              >
                <article style={{ backgroundColor: "white", borderRadius: "1.25rem", overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: "220px", background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.75rem" }}>
                    <span style={{ backgroundColor: `${resultColor}25`, color: resultColor, padding: "0.25rem 0.875rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 700 }}>
                      {categoryLabel}
                    </span>
                    <div style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "0.875rem", padding: "0.625rem 1.25rem", textAlign: "center" }}>
                      <div style={{ fontWeight: 800, color: resultColor, fontSize: "1.25rem" }}>{result}</div>
                    </div>
                  </div>

                  <div style={{ padding: "1.75rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#0d1b2a", lineHeight: 1.4, marginBottom: "0.625rem" }}>{title}</h3>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1.25rem", flex: 1 }}>{description}</p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "1.25rem" }}>
                      {tools.map((tool) => (
                        <span key={tool} style={{ backgroundColor: "#f0f4f8", color: "#475569", padding: "0.2rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 600 }}>
                          {tool}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#4361EE", fontWeight: 700, fontSize: "0.9rem" }}>
                      Ver case completo <ArrowRight size={16} />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
