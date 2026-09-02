import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Author } from "@/types/database.types";
import { FounderCard } from "./FounderCard";

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

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: authorsData } = await client
    .from("authors")
    .select("*")
    .eq("status", "active")
    .order("order");
  const authors = (authorsData ?? []) as Author[];

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
              para negócios e a sociedade ao redor.
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
            A People &amp; Growth é formada por Thiago Leal, Gustavo Monken e Raul Salustiano — especialistas em Marketing, Growth, dados e Inteligência Artificial que, juntos, também dedicam parte do seu tempo a discutir os temas sociais, econômicos e ambientais que moldam pessoas e empresas.
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

      {/* Founders */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
        <div className="container-xl">
          <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 3rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
              Quem faz a People &amp; Growth
            </h2>
            <p style={{ color: "var(--site-muted)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
              Três olhares, uma mesma convicção: negócios fortes nascem de pessoas fortes — e de um olhar atento ao que acontece ao redor delas.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {authors.map((author) => (
              <FounderCard key={author.id} author={author} />
            ))}
          </div>

          <p style={{ color: "var(--site-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.75, maxWidth: "760px", margin: "3rem auto 0", textAlign: "center" }}>
            Juntos, unem consultoria de negócios, tecnologia e um espaço de conteúdo — notícias e a coluna de opinião <strong>Mea Sententia</strong> — com lives aos sábados e vídeos ao longo da semana sobre temas que vão de negócios a política, economia e meio ambiente, no regional, no Brasil e no mundo.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
        <div className="container-xl">
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--site-text)",
              marginBottom: "0.75rem",
              textAlign: "center",
            }}
          >
            {t("philosophy")}
          </h2>
          <p style={{ color: "var(--site-muted)", textAlign: "center", marginBottom: "3rem", fontSize: "1.0625rem" }}>
            Os princípios que guiam cada projeto, consultoria e treinamento.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {philosophy.map(({ icon, title, description }) => (
              <div
                key={title}
                className="hover-card"
                style={{
                  backgroundColor: "var(--site-surface-alt)",
                  borderRadius: "1rem",
                  padding: "2rem",
                  border: "1px solid var(--site-border)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", marginBottom: "0.5rem" }}>
                  {title}
                </h3>
                <p style={{ color: "var(--site-muted)", fontSize: "0.9rem", lineHeight: 1.65 }}>{description}</p>
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
                description: "Consultoria, treinamentos e conteúdo sobre negócios, pessoas e os temas sociais, políticos e ambientais que os impactam.",
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
                description: "Coluna de opinião com perspectivas sobre negócios, sociedade e os temas que moldam o momento atual.",
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
                className="hover-card-dark"
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
      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "560px", margin: "0 auto" }}>
          <Lightbulb size={40} color="#4361EE" style={{ marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
            Vamos criar algo juntos?
          </h2>
          <p style={{ color: "var(--site-muted)", fontSize: "1.0625rem", marginBottom: "2rem" }}>
            Agende uma conversa e descubra como podemos ajudar sua empresa a crescer.
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
