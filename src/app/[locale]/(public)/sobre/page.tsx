import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, GraduationCap, Briefcase, Award, Lightbulb } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

const timeline = [
  { year: "2016", label: "Início em Marketing Digital", description: "Primeiros projetos com tráfego pago e estratégias de conteúdo.", type: "education" },
  { year: "2018", label: "Pós-graduação em Gestão de Pessoas e Negócios", description: "Formação com foco na integração entre gestão de pessoas e resultados de negócio.", type: "education" },
  { year: "2019", label: "MBA Marketing Digital", description: "Aprofundamento em estratégias digitais, SEO, performance e brand building.", type: "education" },
  { year: "2020", label: "MBA Estratégia Data Driven", description: "Especialização em tomada de decisão orientada por dados e métricas.", type: "education" },
  { year: "2021", label: "MBA Big Data", description: "Estudo avançado de ciência de dados, BI e analytics aplicados a negócios.", type: "education" },
  { year: "2022", label: "Criação da People & Growth", description: "Fundação da marca com o propósito de transformar negócios através de pessoas, marketing e dados.", type: "milestone" },
  { year: "2023", label: "Mestrado em Marketing Digital e Big Data", description: "Formação acadêmica avançada unindo marketing digital e ciência de dados.", type: "education" },
  { year: "2024", label: "Fundação da Neuro Botics", description: "Empresa especializada em soluções de IA e automação para negócios.", type: "milestone" },
  { year: "2025", label: "Referência em Estratégia e Inovação", description: "Consolidação como especialista em Marketing, Growth, IA e Estratégia com atuação nacional.", type: "milestone" },
];

const philosophy = [
  {
    icon: "🌱",
    title: "Crescimento sustentável",
    description: "Resultados duradouros nascem de estratégias bem fundamentadas, não de atalhos. Prefiro crescimento sólido a picos sem continuidade.",
  },
  {
    icon: "📊",
    title: "Decisões baseadas em dados",
    description: "Cada estratégia começa com análise. Dados eliminam achismos e aumentam a probabilidade de acertar as apostas certas.",
  },
  {
    icon: "👥",
    title: "Pessoas como diferencial",
    description: "Times engajados e bem desenvolvidos constroem vantagens competitivas que tecnologia sozinha não consegue replicar.",
  },
  {
    icon: "🤖",
    title: "Uso estratégico da IA",
    description: "IA não substitui pessoas — amplifica capacidades. O segredo é integrá-la de forma estratégica, ética e orientada a resultados.",
  },
];

export default async function SobrePage() {
  const t = await getTranslations("about");

  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)",
          paddingTop: "6rem",
          paddingBottom: "5rem",
          color: "white",
        }}
      >
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "rgba(6,214,160,0.15)",
              color: "#06D6A0",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            {t("title")}
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "1.25rem",
            }}
          >
            Estratégia, dados e pessoas
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #4361EE, #06D6A0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              para negócios que crescem.
            </span>
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              marginBottom: "2rem",
            }}
          >
            Sou Thiago Leal — especialista em Marketing Digital, Growth e Inteligência Artificial com mais de 7 anos de experiência transformando negócios através de estratégia, dados e inovação.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/contato"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#4361EE",
                color: "white",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                boxShadow: "0 4px 24px -4px rgba(67,97,238,0.5)",
              }}
            >
              Agendar conversa <ArrowRight size={18} />
            </Link>
            <Link
              href="/curriculo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
              }}
            >
              Ver currículo
            </Link>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="section-padding" style={{ backgroundColor: "white" }}>
        <div
          className="container-xl"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          {/* Photo placeholder */}
          <div
            style={{
              aspectRatio: "4/5",
              borderRadius: "1.5rem",
              background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "380px",
              gap: "0.5rem",
            }}
          >
            <div style={{ fontSize: "4rem" }}>👤</div>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>Foto profissional</span>
          </div>

          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.25rem" }}>
              Olá, sou Thiago Leal.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "#475569", lineHeight: 1.75 }}>
              <p>
                Fundador da <strong>People & Growth</strong> e da <strong>Neuro Botics</strong>, atuo como consultor estratégico, especialista em Growth e Marketing Digital, e pesquisador de aplicações de IA para negócios.
              </p>
              <p>
                Minha trajetória une marketing, gestão de pessoas, dados e inteligência artificial em uma visão integrada de como empresas crescem. Acredito que negócios fortes nascem de pessoas fortes — e que dados são o elo entre estratégia e execução.
              </p>
              <p>
                Ao longo de mais de 7 anos, ajudei empresas de diferentes segmentos a estruturarem seu marketing, acelerarem o crescimento e tomarem decisões mais inteligentes com dados e IA.
              </p>
              <p>
                Hoje, além da consultoria e dos projetos na Neuro Botics, produzo conteúdo pela newsletter <strong>Mea Sententia</strong>, ministro treinamentos corporativos e me posiciono como referência em estratégia, crescimento e inovação.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.75rem" }}>
              {["Marketing Digital", "Growth", "IA", "Business Intelligence", "Consultoria", "Treinamentos", "Neuromarketing"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: "#f0f4f8",
                    color: "#475569",
                    padding: "0.375rem 0.875rem",
                    borderRadius: "9999px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding" style={{ backgroundColor: "#f0f4f8" }}>
        <div className="container-xl">
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
              color: "#0d1b2a",
              marginBottom: "3rem",
              textAlign: "center",
            }}
          >
            {t("timelineTitle")}
          </h2>

          <div style={{ position: "relative", maxWidth: "720px", margin: "0 auto" }}>
            {/* Line */}
            <div
              style={{
                position: "absolute",
                left: "1.25rem",
                top: 0,
                bottom: 0,
                width: "2px",
                backgroundColor: "#e2e8f0",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {timeline.map(({ year, label, description, type }, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "2rem",
                    paddingBottom: "2rem",
                    position: "relative",
                  }}
                >
                  {/* Dot */}
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "50%",
                      backgroundColor: type === "milestone" ? "#4361EE" : "#06D6A0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      zIndex: 1,
                      border: "3px solid white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {type === "milestone" ? (
                      <Award size={12} color="white" />
                    ) : (
                      <GraduationCap size={12} color="white" />
                    )}
                  </div>

                  <div style={{ paddingTop: "0.4rem" }}>
                    <div
                      style={{
                        display: "inline-block",
                        backgroundColor: type === "milestone" ? "rgba(67,97,238,0.1)" : "rgba(6,214,160,0.1)",
                        color: type === "milestone" ? "#4361EE" : "#04a87d",
                        padding: "0.125rem 0.625rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        marginBottom: "0.375rem",
                      }}
                    >
                      {year}
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0d1b2a", marginBottom: "0.25rem" }}>
                      {label}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding" style={{ backgroundColor: "white" }}>
        <div className="container-xl">
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
              color: "#0d1b2a",
              marginBottom: "0.75rem",
              textAlign: "center",
            }}
          >
            {t("philosophy")}
          </h2>
          <p style={{ color: "#64748b", textAlign: "center", marginBottom: "3rem", fontSize: "1.0625rem" }}>
            Os princípios que guiam cada projeto, consultoria e treinamento.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {philosophy.map(({ icon, title, description }) => (
              <div
                key={title}
                style={{
                  backgroundColor: "#f0f4f8",
                  borderRadius: "1rem",
                  padding: "2rem",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "#0d1b2a", marginBottom: "0.5rem" }}>
                  {title}
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.65 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section-padding" style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", color: "white" }}>
        <div className="container-xl">
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, textAlign: "center", marginBottom: "3rem" }}>
            Projetos & Iniciativas
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {[
              {
                name: "People & Growth",
                description: "Plataforma de autoridade em Marketing, Growth, Dados e IA. Consultoria, conteúdo e treinamentos.",
                icon: "🚀",
                color: "#4361EE",
              },
              {
                name: "Neuro Botics",
                description: "Empresa especializada em soluções de IA, automação e agentes inteligentes para negócios.",
                icon: "🤖",
                color: "#06D6A0",
              },
              {
                name: "Mea Sententia",
                description: "Newsletter sobre Marketing, Growth, Liderança e IA com perspectivas estratégicas e práticas.",
                icon: "✍️",
                color: "#FFB703",
              },
              {
                name: "Axia Consulting",
                description: "Projeto de consultoria estratégica focado em transformação digital e crescimento empresarial.",
                icon: "📊",
                color: "#4361EE",
              },
            ].map(({ name, description, icon, color }) => (
              <div
                key={name}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.75rem",
                }}
              >
                <div
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "0.875rem",
                    backgroundColor: `${color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  {icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.5rem" }}>{name}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.65 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding" style={{ backgroundColor: "#f0f4f8", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "560px", margin: "0 auto" }}>
          <Lightbulb size={40} color="#4361EE" style={{ marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.75rem" }}>
            Vamos criar algo juntos?
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.0625rem", marginBottom: "2rem" }}>
            Agende uma conversa e descubra como posso ajudar sua empresa a crescer.
          </p>
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
              boxShadow: "0 4px 24px -4px rgba(67,97,238,0.4)",
            }}
          >
            Agendar conversa <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
