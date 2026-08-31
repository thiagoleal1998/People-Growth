import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Star } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "testimonials" });
  return { title: t("title"), description: t("subtitle") };
}

const testimonials = [
  { name: "Ana Carolina Santos", role: "CEO", company: "TechStar Soluções", text: "O Thiago transformou nossa estratégia de marketing digital. Em 6 meses triplicamos o tráfego orgânico e a geração de leads qualificados aumentou 40%. Metodologia clara e foco total em resultados.", rating: 5 },
  { name: "Roberto Alves", role: "Diretor de Marketing", company: "Grupo Expansão", text: "A consultoria de Growth do Thiago foi fundamental para reduzirmos nosso CAC em 35%. Ele tem uma visão única que conecta dados, estratégia e execução de forma simples e eficiente.", rating: 5 },
  { name: "Mariana Costa", role: "Fundadora", company: "Digital Flow", text: "Fiz a mentoria com o Thiago e foi transformador para minha carreira. Em 3 meses sai de um cargo operacional para assumir a diretoria de marketing. A clareza de posicionamento que ele me deu foi fundamental.", rating: 5 },
  { name: "Carlos Henrique Lima", role: "Head of Growth", company: "SaaS Venture", text: "O treinamento de OKR e KPI que o Thiago ministrou para nosso time foi excelente. Prático, com exemplos reais e metodologia que conseguimos implementar imediatamente. Recomendo muito!", rating: 5 },
  { name: "Fernanda Rodrigues", role: "CMO", company: "E-commerce Brasil", text: "Implementamos os agentes de IA sugeridos pelo Thiago no nosso fluxo de marketing e reduzimos em 50% o tempo gasto em tarefas repetitivas. ROI absurdo. Ele realmente entende de negócios.", rating: 5 },
  { name: "Paulo Nascimento", role: "Diretor Geral", company: "Consultoria Ágil", text: "O dashboard de BI que o Thiago desenvolveu para nossa operação nos deu visibilidade que nunca tivemos. Hoje tomamos decisões muito mais rápidas e embasadas. Transformou nossa gestão.", rating: 5 },
];

export default async function DepoimentosPage() {
  const t = await getTranslations("testimonials");

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem" }}>
            {testimonials.map(({ name, role, company, text, rating }) => (
              <div key={name} style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.25rem" }}>
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={16} fill="#FFB703" color="#FFB703" />
                  ))}
                </div>
                <p style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.75, flex: 1, marginBottom: "1.5rem", fontStyle: "italic" }}>
                  &ldquo;{text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", background: "linear-gradient(135deg, #4361EE, #06D6A0)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1rem" }}>
                    {name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0d1b2a", fontSize: "0.9375rem" }}>{name}</div>
                    <div style={{ color: "#64748b", fontSize: "0.8125rem" }}>{role} · {company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
