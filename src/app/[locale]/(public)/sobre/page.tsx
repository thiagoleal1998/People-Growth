import type { Metadata } from "next";
import { PEOPLE_GROWTH_LOGO_URL, PONTO_DE_REPLICA_LOGO_URL, MEA_SENTENTIA_LOGO_URL } from "@/lib/brand-logos";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Author } from "@/types/database.types";
import { pickLocale } from "@/lib/locale-content";
import { INSTITUTIONAL_DEFAULTS } from "@/lib/institutional-defaults";
import { extractPhilosophyLevels } from "@/lib/philosophy-levels";
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

export default async function SobrePage() {
  const t = await getTranslations("about");
  const locale = await getLocale();

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  // The four levels come from the "O que é" text, so this section always matches
  // that page; the built-in wording is only a fallback if the text can't be read.
  const { data: essay } = await client.from("institutional_pages").select("body_pt, body_en").eq("slug", "o-que-e-o-grupo-festina").maybeSingle();
  const essayBody = pickLocale(locale, essay?.body_pt, essay?.body_en) || (locale === "en" ? INSTITUTIONAL_DEFAULTS["o-que-e-o-grupo-festina"].bodyEn : INSTITUTIONAL_DEFAULTS["o-que-e-o-grupo-festina"].bodyPt) || "";
  const ICONS = ["🧠", "🤝", "👥", "📈"];
  const extracted = extractPhilosophyLevels(essayBody);
  const philosophy = extracted.length === 4
    ? extracted.map((level, i) => ({ icon: ICONS[i], title: level.title, description: level.description }))
    : [
        { icon: "🧠", title: t("level1Title"), description: t("level1Desc") },
        { icon: "🤝", title: t("level2Title"), description: t("level2Desc") },
        { icon: "👥", title: t("level3Title"), description: t("level3Desc") },
        { icon: "📈", title: t("level4Title"), description: t("level4Desc") },
      ];
  const { data: authorsData } = await client
    .from("authors")
    .select("*")
    .eq("status", "active")
    .eq("is_founder", true)
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
              backgroundColor: "rgba(200, 154, 74,0.15)",
              color: "#C89A4A",
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
                background: "linear-gradient(135deg, #315E9C, #C89A4A)",
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
            O Grupo Festina é formado por Thiago Leal, Gustavo Monken e Raul Salustiano — especialistas em Marketing, Growth, dados e Inteligência Artificial que, juntos, também dedicam parte do seu tempo a discutir os temas sociais, econômicos e ambientais que moldam pessoas e empresas.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/contato"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#315E9C",
                color: "white",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                boxShadow: "0 4px 24px -4px rgba(49, 94, 156,0.5)",
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

      {/* Brands */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "1.25rem" }}>
            {t("brandsTitle")}
          </h2>
          <p style={{ color: "var(--site-muted)", fontSize: "1.0625rem", lineHeight: 1.75, marginBottom: "2.5rem" }}>
            {t("brandsIntro")}
          </p>
        </div>
        <div className="container-xl" style={{ maxWidth: "960px", margin: "0 auto 4rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "1.5rem" }}>
            {[
              {
                name: "People & Growth",
                description: locale === "en" ? "Consulting, courses and articles on leadership and personal development." : "Consultoria, cursos e artigos sobre liderança e desenvolvimento pessoal.",
                logo: PEOPLE_GROWTH_LOGO_URL,
                href: "/people-growth" as const,
              },
              {
                name: "Ponto de Réplica",
                description: locale === "en" ? "Independent coverage of politics, economy and society." : "Cobertura independente de política, economia e sociedade.",
                logo: PONTO_DE_REPLICA_LOGO_URL,
                href: "/ponto-de-replica" as const,
              },
              {
                name: "Mea Sententia",
                description: locale === "en" ? "Opinion column on business, society and the issues shaping the current moment." : "Coluna de opinião sobre negócios, sociedade e os temas que moldam o momento atual.",
                logo: MEA_SENTENTIA_LOGO_URL,
                href: "/mea-sententia" as const,
              },
            ].map(({ name, description, logo, href }) => (
              <Link
                key={name}
                href={href}
                className="hover-card"
                style={{
                  display: "block",
                  textDecoration: "none",
                  backgroundColor: "var(--site-card)",
                  border: "1px solid var(--site-border)",
                  borderRadius: "1rem",
                  padding: "1.75rem",
                }}
              >
                <div
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "0.875rem",
                    backgroundColor: "white",
                    border: "1px solid var(--site-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.375rem",
                    marginBottom: "1rem",
                    overflow: "hidden",
                  }}
                >
                  <img src={logo} alt={name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", marginBottom: "0.5rem" }}>{name}</h3>
                <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.65 }}>{description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="container-xl" style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center", paddingTop: "2.5rem", borderTop: "1px solid var(--site-border)" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "1.25rem" }}>
            {t("summaryTitle")}
          </h2>
          <p style={{ color: "var(--site-muted)", fontSize: "1.0625rem", lineHeight: 1.75, marginBottom: "2rem" }}>
            {t("summaryBody1")}
          </p>
          <Link
            href="/sobre/o-que-e-o-grupo-festina"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#315E9C",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {t("summaryCta")} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* One section per brand */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
        <div className="container-xl" style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "3rem" }}>
          {[
            {
              name: "People & Growth",
              color: "#315E9C",
              logo: PEOPLE_GROWTH_LOGO_URL,
              body:
                locale === "en"
                  ? "Our consulting, courses and content arm on leadership and personal development. It's where the group started — organized around four levels of development: Person, Leadership, Team and Business."
                  : "Nossa frente de consultoria, cursos e conteúdo sobre liderança e desenvolvimento pessoal. Foi por onde o grupo começou — organizada em quatro níveis de desenvolvimento: Pessoa, Liderança, Equipe e Negócio.",
              cta: locale === "en" ? "Visit People & Growth" : "Conhecer a People & Growth",
              href: "/people-growth" as const,
            },
            {
              name: "Ponto de Réplica",
              color: "#6A4C93",
              logo: PONTO_DE_REPLICA_LOGO_URL,
              body:
                locale === "en"
                  ? "Our independent coverage of politics, economy and society — the issues shaping the current moment, covered in depth."
                  : "Nossa cobertura independente de política, economia e sociedade — os temas que moldam o momento atual, analisados com profundidade.",
              cta: locale === "en" ? "Visit Ponto de Réplica" : "Conhecer o Ponto de Réplica",
              href: "/ponto-de-replica" as const,
            },
            {
              name: "Mea Sententia",
              color: "#C89A4A",
              logo: MEA_SENTENTIA_LOGO_URL,
              body:
                locale === "en"
                  ? "Our opinion column — a space for perspectives on business, society and the issues that impact people and companies, signed by whoever writes them."
                  : "Nossa coluna de opinião — um espaço para perspectivas sobre negócios, sociedade e os temas que impactam pessoas e empresas, assinadas por quem escreve.",
              cta: locale === "en" ? "Visit Mea Sententia" : "Conhecer a Mea Sententia",
              href: "/mea-sententia" as const,
            },
          ].map(({ name, color, logo, body, cta, href }) => (
            <div key={name} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  flexShrink: 0,
                  borderRadius: "0.875rem",
                  backgroundColor: "white",
                  border: "1px solid var(--site-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.375rem",
                  overflow: "hidden",
                }}
              >
                <img src={logo} alt={name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--site-text)", marginBottom: "0.5rem" }}>{name}</h3>
                <p style={{ color: "var(--site-muted)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "0.875rem" }}>{body}</p>
                <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color, fontWeight: 700, textDecoration: "none", fontSize: "0.9375rem" }}>
                  {cta} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Founders */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
        <div className="container-xl">
          <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 3rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
              Quem faz o Grupo Festina
            </h2>
            <p style={{ color: "var(--site-muted)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
              Três olhares, uma mesma convicção: negócios fortes nascem de pessoas fortes — e de um olhar atento ao que acontece ao redor delas.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "1.5rem" }}>
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
            {t("philosophySubtitle")}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "1.5rem" }}>
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
                <p style={{ color: "var(--site-muted)", fontSize: "0.9rem", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "560px", margin: "0 auto" }}>
          <Lightbulb size={40} color="#315E9C" style={{ marginBottom: "1rem" }} />
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
              backgroundColor: "#315E9C",
              color: "white",
              padding: "0.875rem 2rem",
              borderRadius: "0.75rem",
              fontWeight: 700,
              boxShadow: "0 4px 24px -4px rgba(49, 94, 156,0.4)",
            }}
          >
            Agendar conversa <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
