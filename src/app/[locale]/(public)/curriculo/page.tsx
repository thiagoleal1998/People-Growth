import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Download, GraduationCap, Briefcase, Award, BookOpen, Mic, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resume" });
  return {
    title: t("title"),
    description: "Formação acadêmica, certificações, experiências profissionais e conquistas de Thiago Leal.",
  };
}

const education = [
  { degree: "Mestrado em Marketing Digital e Big Data", institution: "Em curso", year: "2023–" },
  { degree: "MBA Big Data", institution: "Faculdade XP / IGTI", year: "2022" },
  { degree: "MBA Estratégia Data Driven", institution: "Faculdade XP", year: "2021" },
  { degree: "MBA Marketing Digital", institution: "Fundação Getúlio Vargas (FGV)", year: "2020" },
  { degree: "Pós-graduação em Gestão de Pessoas e Negócios", institution: "Instituição Superior", year: "2018" },
  { degree: "Graduação em Marketing", institution: "Universidade Federal", year: "2016" },
];

const certifications = [
  "Google Ads Certified",
  "Google Analytics 4",
  "Meta Blueprint",
  "HubSpot Marketing Certified",
  "RD Station Marketing",
  "Power BI Data Analyst",
  "Scrum Master",
  "OKR Practitioner",
  "Prompt Engineering (OpenAI)",
  "IA Generativa para Negócios",
  "Neuromarketing Certification",
  "Growth Hacking na Prática",
];

const experience = [
  {
    role: "Fundador & Consultor Estratégico",
    company: "People & Growth",
    period: "2022 – Atual",
    description: "Consultoria em Marketing, Growth e IA para empresas de médio e grande porte. Produção de conteúdo estratégico pela newsletter Mea Sententia. Desenvolvimento de treinamentos corporativos.",
    highlights: ["30+ empresas atendidas", "500+ alunos treinados", "100+ artigos publicados"],
  },
  {
    role: "Consultor em Marketing & Growth",
    company: "Axia Consulting",
    period: "2021 – 2023",
    description: "Diagnóstico e reestruturação de estratégias de marketing digital para empresas em fase de crescimento.",
    highlights: ["Crescimento médio de 40% em leads", "Redução de CAC em 25%", "Implementação de BI para 8 clientes"],
  },
  {
    role: "Gerente de Marketing Digital",
    company: "Empresa do Setor",
    period: "2019 – 2021",
    description: "Gestão do time de marketing com foco em growth, performance e branding digital.",
    highlights: ["Equipe de 8 pessoas", "Aumento de 60% no tráfego orgânico", "ROAS médio de 4.2x"],
  },
];

const awards = [
  { title: "Top Voice em Marketing Digital", org: "LinkedIn", year: "2024" },
  { title: "Melhor Caso de Uso de IA em Marketing", org: "Evento Inovação BR", year: "2024" },
  { title: "Finalista — Profissional de Marketing do Ano", org: "Prêmio Digital", year: "2023" },
];

const courses = [
  "KPI na Prática — Turma 2024",
  "OKR na Prática — Múltiplas turmas",
  "5W2H Aplicado — Treinamentos in-company",
  "IA para Times de Marketing — Turmas 2023 e 2024",
  "Neuromarketing para Vendas — Turma 2024",
  "Growth Hacking Avançado — Turma 2023",
];

const events = [
  { title: "Palestra: IA aplicada ao Marketing", event: "Marketing Future Summit", year: "2024" },
  { title: "Workshop: OKRs que Funcionam", event: "HR Tech Conference", year: "2024" },
  { title: "Painel: O Futuro do Growth", event: "Growth Hackers Conference", year: "2023" },
  { title: "Keynote: Dados como Diferencial Competitivo", event: "Data Summit Brasil", year: "2023" },
];

function Section({ icon: Icon, title, children, color = "#4361EE" }: {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div style={{ marginBottom: "3.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "0.625rem",
            backgroundColor: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color={color} />
        </div>
        <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--site-text)" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default async function CurriculoPage() {
  const t = await getTranslations("resume");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: configRow } = await (supabase as any).from("site_config").select("value").eq("key", "contact_email").maybeSingle();
  const contactEmail = configRow?.value || "contato@peoplegrowth.com.br";

  return (
    <>
      {/* Header */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)",
          paddingTop: "6rem",
          paddingBottom: "5rem",
          color: "white",
        }}
      >
        <div
          className="container-xl"
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}
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
                marginBottom: "1rem",
              }}
            >
              {t("title")}
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "0.75rem" }}>
              Thiago Leal
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem" }}>
              Especialista em Marketing Digital, Growth e Inteligência Artificial
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              {contactEmail} · LinkedIn: /in/thiagoleal98
            </p>
          </div>

          <a
            href="/curriculo-thiago-leal.pdf"
            download
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#06D6A0",
              color: "var(--site-text)",
              padding: "0.875rem 1.75rem",
              borderRadius: "0.75rem",
              fontWeight: 700,
              fontSize: "0.9375rem",
              textDecoration: "none",
            }}
          >
            <Download size={18} />
            {t("download")}
          </a>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
        <div className="container-xl" style={{ maxWidth: "900px" }}>
          {/* Education */}
          <Section icon={GraduationCap} title={t("education")} color="#4361EE">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {education.map((item) => (
                <div
                  key={item.degree}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.25rem 1.5rem",
                    backgroundColor: "var(--site-surface-alt)",
                    borderRadius: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--site-text)", fontSize: "0.9375rem" }}>{item.degree}</div>
                    <div style={{ color: "var(--site-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>{item.institution}</div>
                  </div>
                  <span
                    style={{
                      backgroundColor: "rgba(67,97,238,0.1)",
                      color: "#4361EE",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.year}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Experience */}
          <Section icon={Briefcase} title={t("experience")} color="#06D6A0">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {experience.map((item) => (
                <div
                  key={item.role}
                  style={{
                    padding: "1.5rem",
                    border: "1px solid var(--site-border-strong)",
                    borderRadius: "0.75rem",
                    borderLeft: "4px solid #06D6A0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--site-text)", fontSize: "1rem" }}>{item.role}</div>
                      <div style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.875rem" }}>{item.company}</div>
                    </div>
                    <span style={{ color: "var(--site-faint)", fontSize: "0.8125rem", fontWeight: 500 }}>{item.period}</span>
                  </div>
                  <p style={{ color: "var(--site-text-secondary)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "0.875rem" }}>
                    {item.description}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {item.highlights.map((h) => (
                      <span
                        key={h}
                        style={{
                          backgroundColor: "rgba(6,214,160,0.1)",
                          color: "#04a87d",
                          padding: "0.2rem 0.625rem",
                          borderRadius: "9999px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Certifications */}
          <Section icon={Award} title={t("certifications")} color="#FFB703">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
              {certifications.map((cert) => (
                <div
                  key={cert}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--site-surface-alt)",
                    borderRadius: "0.625rem",
                  }}
                >
                  <span style={{ color: "#FFB703", fontSize: "1rem", flexShrink: 0 }}>🏆</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--site-text)" }}>{cert}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Awards */}
          <Section icon={Award} title={t("awards")} color="#4361EE">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {awards.map((award) => (
                <div
                  key={award.title}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                    backgroundColor: "rgba(67,97,238,0.05)",
                    borderRadius: "0.625rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--site-text)", fontSize: "0.9375rem" }}>🥇 {award.title}</div>
                    <div style={{ color: "var(--site-muted)", fontSize: "0.8125rem" }}>{award.org}</div>
                  </div>
                  <span style={{ color: "#4361EE", fontWeight: 700, fontSize: "0.875rem" }}>{award.year}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Courses taught */}
          <Section icon={BookOpen} title={t("courses")} color="#06D6A0">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
              {courses.map((c) => (
                <div
                  key={c}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(6,214,160,0.08)",
                    borderRadius: "0.625rem",
                    border: "1px solid rgba(6,214,160,0.15)",
                  }}
                >
                  <span style={{ color: "#06D6A0", flexShrink: 0 }}>📚</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--site-text)" }}>{c}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Events */}
          <Section icon={Mic} title={t("events")} color="#FFB703">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {events.map((ev) => (
                <div
                  key={ev.title}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                    backgroundColor: "rgba(255,183,3,0.05)",
                    border: "1px solid rgba(255,183,3,0.15)",
                    borderRadius: "0.625rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--site-text)", fontSize: "0.9375rem" }}>🎤 {ev.title}</div>
                    <div style={{ color: "var(--site-muted)", fontSize: "0.8125rem" }}>{ev.event}</div>
                  </div>
                  <span style={{ color: "#cc9200", fontWeight: 700, fontSize: "0.875rem" }}>{ev.year}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>
    </>
  );
}
