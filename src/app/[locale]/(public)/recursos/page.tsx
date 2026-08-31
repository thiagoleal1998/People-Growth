import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Download, FileText, Layout, BookOpen, CheckSquare, Zap } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resources" });
  return { title: t("title"), description: t("subtitle") };
}

const resources = [
  { icon: Layout, type: "template", typeLabel: "Template", title: "Template de OKR", description: "Planilha completa para definir e acompanhar OKRs por trimestre. Inclui exemplos e instruções.", color: "#4361EE", downloads: 842 },
  { icon: FileText, type: "template", typeLabel: "Template", title: "Planilha de KPI", description: "Dashboards de KPIs por área: Marketing, Vendas, Operações e Financeiro.", color: "#4361EE", downloads: 1203 },
  { icon: CheckSquare, type: "checklist", typeLabel: "Checklist", title: "Checklist de Growth", description: "50 pontos para auditar e otimizar o funil de crescimento da sua empresa.", color: "#06D6A0", downloads: 654 },
  { icon: Zap, type: "prompt", typeLabel: "Prompt IA", title: "100 Prompts para Marketing", description: "Coleção de prompts otimizados para criação de conteúdo, anúncios e estratégia de marketing.", color: "#FFB703", downloads: 2341 },
  { icon: BookOpen, type: "guide", typeLabel: "Guia", title: "Guia de Marketing Digital para PMEs", description: "Guia passo a passo para estruturar o marketing digital da sua empresa do zero.", color: "#4361EE", downloads: 987 },
  { icon: FileText, type: "template", typeLabel: "Template", title: "Framework 5W2H para Projetos", description: "Template para planejamento de projetos e campanhas usando a metodologia 5W2H.", color: "#06D6A0", downloads: 445 },
];

export default async function RecursosPage() {
  const t = await getTranslations("resources");

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.75rem" }}>
            {resources.map(({ icon: Icon, typeLabel, title, description, color, downloads }) => (
              <div key={title} style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <div style={{ width: "3rem", height: "3rem", borderRadius: "0.875rem", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={color} />
                  </div>
                  <span style={{ backgroundColor: `${color}12`, color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>{typeLabel}</span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#0d1b2a", marginBottom: "0.5rem" }}>{title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.65, flex: 1, marginBottom: "1.5rem" }}>{description}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "1.25rem" }}>
                  <span style={{ fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 500 }}>{downloads.toLocaleString("pt-BR")} downloads</span>
                  <button style={{ display: "flex", alignItems: "center", gap: "0.375rem", backgroundColor: color, color: color === "#FFB703" ? "#0d1b2a" : "white", padding: "0.5rem 1rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: "pointer" }}>
                    <Download size={14} /> {t("download")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
