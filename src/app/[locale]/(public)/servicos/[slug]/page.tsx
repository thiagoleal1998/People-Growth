import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

const services: Record<string, {
  title: string;
  description: string;
  longDescription: string;
  methodology: string[];
  benefits: string[];
  results: string[];
  color: string;
}> = {
  "consultoria-estrategica": {
    title: "Consultoria Estratégica",
    description: "Diagnóstico completo e plano de crescimento personalizado.",
    longDescription: "A Consultoria Estratégica é o ponto de partida para empresas que querem crescer com inteligência. Através de um diagnóstico profundo do negócio, mercado e concorrência, desenvolvemos um plano estratégico executável que conecta onde você está com onde você quer chegar.",
    methodology: ["Diagnóstico de negócio (360°)", "Análise de mercado e benchmarking", "Mapeamento de oportunidades", "Definição de posicionamento estratégico", "Desenvolvimento do plano de ação (90 dias)", "Definição de KPIs e metas", "Acompanhamento de implementação", "Revisões mensais de resultado"],
    benefits: ["Clareza total sobre onde e como crescer", "Decisões estratégicas embasadas em dados", "Plano de ação executável e priorizado", "Indicadores de sucesso claros desde o início", "Redução de riscos em decisões importantes"],
    results: ["Crescimento médio de 35% em receita após 6 meses", "Redução de 25% no custo de aquisição de clientes", "NPS aumentado em média 20 pontos", "Planos estratégicos implementados em 100+ empresas"],
    color: "#4361EE",
  },
  "growth": {
    title: "Growth Hacking",
    description: "Crescimento acelerado baseado em dados e experimentação.",
    longDescription: "Growth Hacking não é sobre truques — é sobre um método estruturado de acelerar o crescimento do seu negócio. Mapeamos todo o funil, identificamos os gargalos e executamos ciclos rápidos de experimentação para encontrar o que realmente funciona para o seu negócio.",
    methodology: ["Mapeamento completo do funil", "Análise de métricas de growth (AARRR)", "Identificação dos gargalos prioritários", "Ciclo de experimentos (hipótese → teste → análise)", "Otimização de conversão", "Análise de cohort e LTV", "Desenvolvimento de playbooks de crescimento"],
    benefits: ["Crescimento mais rápido e previsível", "Redução do CAC (Custo de Aquisição de Cliente)", "Aumento do LTV e retenção", "Cultura de experimentação no time", "Decisões baseadas em dados, não em achismos"],
    results: ["Crescimento médio de 60% em aquisição em 3 meses", "Redução de 30% no CAC", "Aumento de 25% na taxa de retenção", "Framework de growth implementado em 15+ empresas"],
    color: "#06D6A0",
  },
  "inteligencia-artificial": {
    title: "Inteligência Artificial",
    description: "IA integrada estrategicamente ao seu negócio.",
    longDescription: "Implementamos soluções de Inteligência Artificial que realmente geram resultado — desde a criação de agentes GPT personalizados até automações complexas com n8n e Make. O diferencial é a integração estratégica: IA a serviço dos objetivos do negócio.",
    methodology: ["Mapeamento de processos elegíveis para IA", "Definição de casos de uso prioritários", "Desenvolvimento de agentes GPT customizados", "Criação de workflows com n8n/Make", "Integração com CRM, marketing e vendas", "Treinamento da equipe", "Monitoramento e otimização contínua"],
    benefits: ["Produtividade da equipe amplificada", "Processos repetitivos automatizados", "IA integrada ao fluxo de trabalho", "Vantagem competitiva real e mensurável", "Time habilitado para usar IA estrategicamente"],
    results: ["Redução média de 40% em tempo de processos manuais", "10+ agentes GPT criados e em produção", "ROI médio de 3x nas automações implementadas", "100+ profissionais treinados em IA"],
    color: "#4361EE",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug];
  if (!service) return { title: "Serviço não encontrado" };
  return {
    title: service.title,
    description: service.description,
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services[slug] ?? services["consultoria-estrategica"];

  return (
    <>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "5rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          <Link href="/servicos" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> Serviços
          </Link>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>
            {service.title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>
            {service.longDescription}
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "white" }}>
        <div className="container-xl" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "4rem", alignItems: "start" }}>
          <div>
            {/* Methodology */}
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.5rem" }}>Metodologia</h2>
            <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "3rem" }}>
              {service.methodology.map((item, i) => (
                <li key={item} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span style={{ width: "2rem", height: "2rem", borderRadius: "50%", backgroundColor: `${service.color}15`, color: service.color, fontWeight: 800, fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <span style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.6, paddingTop: "0.25rem" }}>{item}</span>
                </li>
              ))}
            </ol>

            {/* Benefits */}
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.5rem" }}>Benefícios</h2>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "3rem" }}>
              {service.benefits.map((b) => (
                <li key={b} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle2 size={20} color={service.color} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.6 }}>{b}</span>
                </li>
              ))}
            </ul>

            {/* Results */}
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.5rem" }}>Resultados típicos</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {service.results.map((r) => (
                <div key={r} style={{ backgroundColor: "#f0f4f8", borderRadius: "0.75rem", padding: "1.25rem", border: `1px solid ${service.color}25` }}>
                  <p style={{ color: "#0d1b2a", fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.5 }}>✓ {r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div style={{ position: "sticky", top: "5rem" }}>
            <div style={{ backgroundColor: "#f0f4f8", borderRadius: "1.25rem", padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.5rem" }}>
                Solicitar proposta
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                Preencha abaixo e entrarei em contato em até 24h.
              </p>
              <ContactForm serviceDefault={service.title} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
