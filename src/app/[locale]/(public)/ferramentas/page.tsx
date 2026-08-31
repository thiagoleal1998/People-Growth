import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return { title: t("title"), description: t("subtitle") };
}

const tools = [
  { category: "IA & Automação", items: [
    { name: "ChatGPT / GPT-4", description: "A IA mais versátil para criação de conteúdo, análise e automação.", url: "#", icon: "🤖", badge: "Essencial" },
    { name: "Claude (Anthropic)", description: "Excelente para análise de documentos, escrita técnica e raciocínio complexo.", url: "#", icon: "🧠", badge: null },
    { name: "n8n", description: "Automações no-code poderosas. Substituto open-source do Zapier.", url: "#", icon: "⚡", badge: "Favorito" },
    { name: "Make (Integromat)", description: "Automações visuais para conectar qualquer app.", url: "#", icon: "🔄", badge: null },
  ]},
  { category: "Analytics & BI", items: [
    { name: "Power BI", description: "O melhor BI para dashboards executivos e análises de dados.", url: "#", icon: "📊", badge: "Essencial" },
    { name: "Looker Studio", description: "Gratuito e integrado com Google Analytics. Ideal para relatórios de marketing.", url: "#", icon: "📈", badge: null },
    { name: "Google Analytics 4", description: "Análise de comportamento e conversões no site.", url: "#", icon: "🔍", badge: null },
  ]},
  { category: "Marketing & CRM", items: [
    { name: "HubSpot", description: "CRM completo com marketing automation. O melhor para B2B.", url: "#", icon: "🎯", badge: "Favorito" },
    { name: "RD Station", description: "Alternativa brasileira ao HubSpot. Ótimo para PMEs.", url: "#", icon: "🇧🇷", badge: null },
    { name: "Semrush", description: "Ferramenta de SEO, análise de concorrência e palavras-chave.", url: "#", icon: "🔎", badge: null },
  ]},
  { category: "Produtividade", items: [
    { name: "Notion", description: "Wiki, projetos e documentação. O hub central do meu trabalho.", url: "#", icon: "📝", badge: "Essencial" },
    { name: "Linear", description: "Gestão de tarefas rápida e eficiente para times de tecnologia.", url: "#", icon: "✅", badge: null },
    { name: "Loom", description: "Vídeos rápidos para comunicação assíncrona e treinamentos.", url: "#", icon: "🎥", badge: null },
  ]},
];

export default async function FerramentasPage() {
  const t = await getTranslations("tools");

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
          {tools.map(({ category, items }) => (
            <div key={category} style={{ marginBottom: "3rem" }}>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "2px solid #e2e8f0" }}>
                {category}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                {items.map(({ name, description, icon, badge }) => (
                  <div key={name} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(0,0,0,0.06)", position: "relative" }}>
                    {badge && (
                      <span style={{ position: "absolute", top: "1rem", right: "1rem", backgroundColor: badge === "Essencial" ? "rgba(67,97,238,0.12)" : "rgba(6,214,160,0.12)", color: badge === "Essencial" ? "#4361EE" : "#04a87d", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700 }}>
                        {badge}
                      </span>
                    )}
                    <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{icon}</div>
                    <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0d1b2a", marginBottom: "0.375rem" }}>{name}</h3>
                    <p style={{ color: "#64748b", fontSize: "0.8125rem", lineHeight: 1.6 }}>{description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
