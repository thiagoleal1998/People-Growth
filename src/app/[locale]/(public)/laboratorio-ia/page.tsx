import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Bot, Zap, Brain, Cpu } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aiLab" });
  return { title: t("title"), description: t("subtitle") };
}

const projects = [
  { icon: Bot, title: "Agente de Qualificação de Leads", description: "GPT personalizado que qualifica leads automaticamente com base em perguntas estratégicas e integra com CRM.", tags: ["GPT-4", "n8n", "HubSpot"], color: "#4361EE" },
  { icon: Zap, title: "Automação de Conteúdo", description: "Fluxo automatizado que gera, revisa e agenda conteúdo para redes sociais com base no calendário editorial.", tags: ["Make", "ChatGPT", "Buffer"], color: "#06D6A0" },
  { icon: Brain, title: "Análise de Dados com IA", description: "Agente que analisa planilhas de vendas e gera relatórios com insights e recomendações estratégicas.", tags: ["Python", "OpenAI", "Pandas"], color: "#FFB703" },
  { icon: Cpu, title: "Neuro Botics — IA para Negócios", description: "Soluções completas de IA para empresas: agentes, automações, integração com sistemas legados e treinamento de times.", tags: ["Neuro Botics", "GPT-4", "LangChain", "n8n"], color: "#4361EE" },
];

export default async function LaboratorioIAPage() {
  const t = await getTranslations("aiLab");

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "5rem", color: "white", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 50%, rgba(67,97,238,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container-xl" style={{ maxWidth: "700px", margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "rgba(67,97,238,0.2)", color: "#6b80f4", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "1.5rem" }}>
            🤖 {t("title")}
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>
            Explorando o futuro com
            <br />
            <span style={{ background: "linear-gradient(135deg, #4361EE, #06D6A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Inteligência Artificial.
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>{t("subtitle")}</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl">
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "2.5rem", textAlign: "center" }}>
            Projetos & Experimentos
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.75rem" }}>
            {projects.map(({ icon: Icon, title, description, tags, color }) => (
              <div key={title} className="hover-card" style={{ backgroundColor: "var(--site-card)", borderRadius: "1.25rem", padding: "2rem", border: "1px solid var(--site-border)" }}>
                <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "1rem", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--site-text)", marginBottom: "0.625rem" }}>{title}</h3>
                <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>{description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                  {tags.map((tag) => (
                    <span key={tag} style={{ backgroundColor: `${color}12`, color, padding: "0.2rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700 }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", color: "white", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "1rem" }}>
            Neuro Botics
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.0625rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            A Neuro Botics é a empresa de tecnologia do ecossistema People &amp; Growth, especializada em soluções de IA para negócios. Desenvolvemos agentes, automações e integrações que aumentam a produtividade e criam vantagens competitivas reais.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#4361EE", color: "white", padding: "0.875rem 1.75rem", borderRadius: "0.75rem", fontWeight: 700, boxShadow: "0 4px 24px -4px rgba(67,97,238,0.5)" }}>
              Falar sobre IA para meu negócio <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
