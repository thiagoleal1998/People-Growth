import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const cases: Record<string, {
  title: string;
  category: string;
  categoryColor: string;
  challenge: string;
  solution: string;
  tools: string[];
  results: string[];
  metrics: { label: string; value: string }[];
}> = {
  "rebranding-e-crescimento-digital": {
    title: "Rebranding e crescimento 3x em tráfego orgânico",
    category: "Marketing",
    categoryColor: "#4361EE",
    challenge: "Empresa B2B com posicionamento confuso, site desatualizado e tráfego orgânico estagnado há 18 meses. A marca não comunicava seus diferenciais e não aparecia nas buscas relevantes do setor.",
    solution: "Realizamos um rebranding completo da presença digital: nova identidade visual, reestruturação do site com foco em conversão, estratégia de conteúdo SEO para 30 palavras-chave prioritárias e criação de blog com publicação semanal.",
    tools: ["SEO técnico e on-page", "Content Marketing", "Google Analytics 4", "Google Search Console", "Figma", "WordPress", "Semrush"],
    results: ["Tráfego orgânico triplicado em 6 meses", "20 palavras-chave na primeira página do Google", "Taxa de conversão do site aumentada de 0,8% para 2,3%", "NPS da marca aumentou 25 pontos"],
    metrics: [
      { label: "Aumento no tráfego orgânico", value: "+320%" },
      { label: "Palavras-chave no Top 3", value: "20" },
      { label: "Conversão do site", value: "2,3%" },
      { label: "Prazo de entrega", value: "6 meses" },
    ],
  },
  "funil-de-growth-e-reducao-de-cac": {
    title: "Funil de growth com 35% de redução no CAC",
    category: "Growth",
    categoryColor: "#06D6A0",
    challenge: "SaaS B2B com CAC elevado e ciclo de vendas longo. O funil de aquisição não era monitorado adequadamente, com perda de leads em pontos críticos da jornada.",
    solution: "Mapeamos todo o funil AARRR, identificamos os maiores gargalos e criamos um ciclo de experimentação (20 testes em 90 dias). Implementamos automação de nutrição, qualificação de leads com lead scoring e otimização das campanhas por canal.",
    tools: ["HubSpot CRM", "Google Ads", "Meta Ads", "A/B Testing", "Hotjar", "Google Analytics 4", "Make"],
    results: ["CAC reduzido em 35% em 90 dias", "Ciclo de vendas encurtado em 22%", "Taxa de conversão MQL→SQL aumentada em 40%", "ROI das campanhas aumentado de 2x para 3,8x"],
    metrics: [
      { label: "Redução no CAC", value: "-35%" },
      { label: "Ciclo de vendas", value: "-22%" },
      { label: "ROI campanhas", value: "3,8x" },
      { label: "A/B tests realizados", value: "20" },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = cases[slug];
  return { title: c ? c.title : "Case não encontrado" };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = cases[slug] ?? cases["rebranding-e-crescimento-digital"];

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "4rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "840px" }}>
          <Link href="/portfolio" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> Portfólio
          </Link>
          <span style={{ display: "inline-block", backgroundColor: `${c.categoryColor}25`, color: c.categoryColor, padding: "0.25rem 0.875rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "1.25rem" }}>
            {c.category}
          </span>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, lineHeight: 1.2 }}>{c.title}</h1>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "white" }}>
        <div className="container-xl" style={{ maxWidth: "900px" }}>
          {/* Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "3.5rem" }}>
            {c.metrics.map(({ label, value }) => (
              <div key={label} style={{ backgroundColor: "#f0f4f8", borderRadius: "0.875rem", padding: "1.25rem", textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: "1.75rem", color: c.categoryColor, marginBottom: "0.25rem" }}>{value}</div>
                <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1rem" }}>Desafio</h2>
              <p style={{ color: "#475569", lineHeight: 1.75, marginBottom: "2rem" }}>{c.challenge}</p>

              <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1rem" }}>Solução</h2>
              <p style={{ color: "#475569", lineHeight: 1.75 }}>{c.solution}</p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1rem" }}>Ferramentas utilizadas</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
                {c.tools.map((tool) => (
                  <span key={tool} style={{ backgroundColor: "#f0f4f8", color: "#475569", padding: "0.375rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                    {tool}
                  </span>
                ))}
              </div>

              <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1rem" }}>Resultados</h2>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {c.results.map((r) => (
                  <li key={r} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <CheckCircle2 size={18} color={c.categoryColor} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.5 }}>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: "3rem", textAlign: "center" }}>
            <Link href="/contato" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#4361EE", color: "white", padding: "0.875rem 2rem", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.9375rem", boxShadow: "0 4px 24px -4px rgba(67,97,238,0.4)" }}>
              Quero resultados assim no meu negócio →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
