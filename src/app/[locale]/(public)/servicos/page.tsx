import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Target, TrendingUp, Rocket, BarChart3, Brain, Users, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

const services = [
  {
    slug: "consultoria-estrategica",
    icon: Target,
    title: "Consultoria Estratégica",
    description: "Diagnóstico completo do negócio, análise de mercado e desenvolvimento de plano estratégico personalizado com foco em crescimento sustentável.",
    methodology: ["Diagnóstico de negócio", "Análise de mercado e concorrência", "Definição de posicionamento", "Plano estratégico 90 dias", "Acompanhamento de resultados"],
    benefits: ["Clareza sobre onde e como crescer", "Decisões embasadas em dados", "Plano de ação executável", "Indicadores de sucesso definidos"],
    color: "#4361EE",
    tag: "Mais procurado",
  },
  {
    slug: "marketing-digital",
    icon: TrendingUp,
    title: "Marketing Digital",
    description: "Estratégias integradas de marketing digital — do posicionamento de marca à geração de demanda, com gestão de campanhas de performance.",
    methodology: ["Auditoria de presença digital", "Estratégia de conteúdo", "Gestão de campanhas (Google, Meta)", "Email marketing e automação", "Relatórios de performance"],
    benefits: ["Mais visibilidade e autoridade", "Geração de leads qualificados", "ROI mensurável por canal", "Marca fortalecida e consistente"],
    color: "#4361EE",
    tag: null,
  },
  {
    slug: "growth",
    icon: Rocket,
    title: "Growth Hacking",
    description: "Estratégias de crescimento acelerado com foco em aquisição, ativação e retenção de clientes através de experimentação rápida e dados.",
    methodology: ["Mapeamento do funil de crescimento", "Identificação de gargalos", "Ciclo de experimentos (A/B tests)", "Análise de cohort", "Playbooks de crescimento"],
    benefits: ["Crescimento mais rápido e previsível", "CAC reduzido", "LTV maximizado", "Cultura de experimentação"],
    color: "#06D6A0",
    tag: null,
  },
  {
    slug: "business-intelligence",
    icon: BarChart3,
    title: "Business Intelligence",
    description: "Implementação de dashboards, KPIs e cultura data-driven com Power BI, Looker Studio e ferramentas avançadas de analytics.",
    methodology: ["Mapeamento de indicadores", "Arquitetura de dados", "Desenvolvimento de dashboards", "Treinamento do time", "Governança de dados"],
    benefits: ["Visibilidade total do negócio", "Relatórios automatizados", "Decisões mais rápidas e precisas", "Redução de planilhas manuais"],
    color: "#FFB703",
    tag: null,
  },
  {
    slug: "inteligencia-artificial",
    icon: Brain,
    title: "Inteligência Artificial",
    description: "Implementação de soluções de IA para automação de processos, criação de agentes GPT e integração de inteligência artificial no fluxo de trabalho.",
    methodology: ["Mapeamento de processos elegíveis", "Criação de agentes GPT", "Automações com n8n/Make", "Integração com CRM e marketing", "Treinamento da equipe"],
    benefits: ["Produtividade amplificada", "Processos automatizados", "IA integrada ao negócio", "Vantagem competitiva real"],
    color: "#4361EE",
    tag: "Novo",
  },
  {
    slug: "treinamentos",
    icon: Users,
    title: "Treinamentos Corporativos",
    description: "Capacitação personalizada em Marketing, IA, OKR, KPI, 5W2H e Neuromarketing para times e líderes empresariais.",
    methodology: ["Diagnóstico de necessidades", "Trilha de aprendizagem customizada", "Aulas práticas e casos reais", "Material didático incluso", "Acompanhamento pós-treinamento"],
    benefits: ["Time mais capacitado", "Aplicação imediata do aprendizado", "Cultura de desenvolvimento contínuo", "Certificado de conclusão"],
    color: "#06D6A0",
    tag: null,
  },
  {
    slug: "mentoria",
    icon: Sparkles,
    title: "Mentoria",
    description: "Acompanhamento individual para profissionais que querem se posicionar como referência em Marketing, Growth e IA.",
    methodology: ["Sessão de diagnóstico", "Plano de desenvolvimento personalizado", "Sessões semanais 1:1", "Acesso a materiais exclusivos", "Comunidade de mentorados"],
    benefits: ["Clareza sobre sua trajetória", "Aceleração profissional", "Network qualificado", "Posicionamento de autoridade"],
    color: "#FFB703",
    tag: null,
  },
];

export default async function ServicosPage() {
  const t = await getTranslations("services");

  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)",
          paddingTop: "6rem",
          paddingBottom: "5rem",
          color: "white",
          textAlign: "center",
        }}
      >
        <div className="container-xl" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "rgba(67,97,238,0.2)",
              color: "#6b80f4",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
            }}
          >
            {t("title")}
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>
            Soluções estratégicas para
            <br />
            <span style={{ background: "linear-gradient(135deg, #4361EE, #06D6A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              negócios que querem crescer.
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-padding" style={{ backgroundColor: "#f0f4f8" }}>
        <div className="container-xl">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "2rem" }}>
            {services.map(({ slug, icon: Icon, title, description, methodology, benefits, color, tag }) => (
              <div
                key={slug}
                style={{
                  backgroundColor: "white",
                  borderRadius: "1.25rem",
                  padding: "2rem",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {tag && (
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      backgroundColor: color === "#06D6A0" ? "rgba(6,214,160,0.12)" : "rgba(67,97,238,0.12)",
                      color: color === "#06D6A0" ? "#04a87d" : "#4361EE",
                      padding: "0.2rem 0.625rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {tag}
                  </div>
                )}

                <div
                  style={{
                    width: "3.25rem",
                    height: "3.25rem",
                    borderRadius: "0.875rem",
                    backgroundColor: `${color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                  }}
                >
                  <Icon size={22} color={color} />
                </div>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.625rem" }}>
                  {title}
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem", flex: 1 }}>
                  {description}
                </p>

                {/* Benefits */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.625rem" }}>
                    Benefícios
                  </p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    {benefits.slice(0, 3).map((benefit) => (
                      <li key={benefit} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                        <CheckCircle2 size={14} color={color} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={{ pathname: "/servicos/[slug]", params: { slug } }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    backgroundColor: color,
                    color: color === "#FFB703" ? "#0d1b2a" : "white",
                    padding: "0.875rem",
                    borderRadius: "0.75rem",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                  }}
                >
                  Solicitar proposta <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding" style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
            Como funciona a consultoria
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.0625rem", marginBottom: "3.5rem" }}>
            Um processo estruturado para gerar resultados reais.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.5rem", textAlign: "left" }}>
            {[
              { step: "01", title: "Diagnóstico", desc: "Entendimento profundo do negócio, desafios e oportunidades." },
              { step: "02", title: "Estratégia", desc: "Desenvolvimento do plano estratégico personalizado." },
              { step: "03", title: "Execução", desc: "Implementação com acompanhamento próximo." },
              { step: "04", title: "Resultados", desc: "Medição, ajuste e consolidação dos ganhos." },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: "2rem", color: "rgba(67,97,238,0.4)", marginBottom: "0.5rem", lineHeight: 1 }}>
                  {step}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.375rem" }}>{title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "3rem" }}>
            <Link
              href="/contato"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#4361EE",
                color: "white",
                padding: "0.875rem 2rem",
                borderRadius: "0.75rem",
                fontWeight: 700,
                boxShadow: "0 4px 24px -4px rgba(67,97,238,0.5)",
              }}
            >
              Agendar conversa gratuita <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
