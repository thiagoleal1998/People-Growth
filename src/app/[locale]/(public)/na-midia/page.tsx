import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mic, Video, BookOpen, Calendar } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "media" });
  return { title: t("title"), description: t("subtitle") };
}

const items = [
  { type: "interview", icon: Mic, title: "Entrevista: IA e o futuro do Marketing Digital", outlet: "Podcast Marketing Play", date: "Mar 2025", color: "#4361EE" },
  { type: "event", icon: Video, title: "Palestra: Growth na Era da IA", outlet: "Summit Marketing Brasil", date: "Fev 2025", color: "#06D6A0" },
  { type: "article", icon: BookOpen, title: "Artigo: Como usar dados para tomar melhores decisões", outlet: "Resultados Digitais Blog", date: "Jan 2025", color: "#FFB703" },
  { type: "interview", icon: Mic, title: "Podcast: Construindo autoridade no LinkedIn", outlet: "Negócios Digitais Cast", date: "Dez 2024", color: "#4361EE" },
  { type: "event", icon: Video, title: "Workshop: OKRs que Funcionam", outlet: "HR Tech Conference 2024", date: "Nov 2024", color: "#06D6A0" },
  { type: "article", icon: BookOpen, title: "Coluna: Neuromarketing e decisões de compra", outlet: "E-commerce Brasil", date: "Out 2024", color: "#FFB703" },
];

export default async function NaMidiaPage() {
  const t = await getTranslations("media");

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {items.map(({ icon: Icon, title, outlet, date, color }) => (
              <div key={title} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: "1.25rem" }}>
                <div style={{ width: "3rem", height: "3rem", borderRadius: "0.875rem", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0d1b2a", lineHeight: 1.4, marginBottom: "0.375rem" }}>{title}</h3>
                  <div style={{ color: "#64748b", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.25rem" }}>{outlet}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#94a3b8", fontSize: "0.75rem" }}>
                    <Calendar size={12} /> {date}
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
