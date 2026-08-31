import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Search, ChevronRight } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newsletter" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

const articles = [
  {
    title: "Como usar IA para acelerar sua estratégia de Growth",
    excerpt: "Descubra como ferramentas de IA estão transformando a forma como empresas escalam seus resultados de forma inteligente e mensurável.",
    category: "IA",
    categoryColor: "#FFB703",
    date: "18 Jun 2025",
    slug: "ia-estrategia-growth",
    readTime: 8,
    featured: true,
  },
  {
    title: "OKRs na prática: como definir metas que realmente funcionam",
    excerpt: "Um guia completo para implementar OKRs em empresas de qualquer tamanho com resultados mensuráveis e times engajados.",
    category: "Estratégia",
    categoryColor: "#4361EE",
    date: "10 Mai 2025",
    slug: "okrs-na-pratica",
    readTime: 6,
    featured: false,
  },
  {
    title: "Neuromarketing: como o cérebro decide e o que isso muda no Marketing",
    excerpt: "A neurociência por trás das decisões de compra e como aplicar esses princípios nas suas campanhas de marketing.",
    category: "Marketing",
    categoryColor: "#4361EE",
    date: "22 Abr 2025",
    slug: "neuromarketing-decisoes",
    readTime: 10,
    featured: false,
  },
  {
    title: "Growth vs. Marketing: qual a diferença e por que você precisa dos dois",
    excerpt: "Muita gente confunde Growth com Marketing Digital. Entenda as diferenças, sobreposições e como estruturar os dois na sua empresa.",
    category: "Growth",
    categoryColor: "#06D6A0",
    date: "5 Abr 2025",
    slug: "growth-vs-marketing",
    readTime: 7,
    featured: false,
  },
  {
    title: "KPIs que realmente importam: deixe de medir vaidade",
    excerpt: "A maioria das empresas acompanha métricas de vaidade. Veja como identificar os KPIs que impactam de verdade o crescimento do negócio.",
    category: "Dados",
    categoryColor: "#FFB703",
    date: "18 Mar 2025",
    slug: "kpis-que-importam",
    readTime: 9,
    featured: false,
  },
  {
    title: "Liderança na era da IA: o que muda para gestores e times",
    excerpt: "A IA não vai substituir líderes — mas vai mudar o que se espera deles. Veja as novas competências essenciais para a gestão moderna.",
    category: "Liderança",
    categoryColor: "#06D6A0",
    date: "3 Mar 2025",
    slug: "lideranca-era-ia",
    readTime: 8,
    featured: false,
  },
];

const tags = ["Marketing", "IA", "Liderança", "Dados", "Growth", "Carreira", "OKR", "KPI", "Neuromarketing", "Estratégia"];

export default async function MeaSententiePage() {
  const t = await getTranslations("newsletter");
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

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
        <div className="container-xl" style={{ maxWidth: "720px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "rgba(255,183,3,0.15)",
              color: "#FFB703",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
              letterSpacing: "0.05em",
            }}
          >
            NEWSLETTER
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "1rem",
              fontStyle: "italic",
            }}
          >
            Mea Sententia
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            {t("subtitle")}
          </p>

          {/* Subscribe form */}
          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            <NewsletterForm />
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "#f0f4f8" }}>
        <div className="container-xl">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "3rem", alignItems: "start" }}>
            {/* Articles */}
            <div>
              {/* Featured */}
              {featured && (
                <div style={{ marginBottom: "2.5rem" }}>
                  <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#64748b", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Destaque
                  </h2>
                  <Link
                    href={{ pathname: "/mea-sententia/[slug]", params: { slug: featured.slug } }}
                    style={{ display: "block", textDecoration: "none" }}
                  >
                    <article
                      style={{
                        backgroundColor: "white",
                        borderRadius: "1.25rem",
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        style={{
                          height: "280px",
                          background: `linear-gradient(135deg, #0d1b2a, #1a1f3e)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: `${featured.categoryColor}25`,
                            color: featured.categoryColor,
                            padding: "0.4rem 1rem",
                            borderRadius: "9999px",
                            fontSize: "0.875rem",
                            fontWeight: 700,
                          }}
                        >
                          {featured.category}
                        </span>
                      </div>
                      <div style={{ padding: "2rem" }}>
                        <h3 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0d1b2a", lineHeight: 1.3, marginBottom: "0.875rem" }}>
                          {featured.title}
                        </h3>
                        <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                          {featured.excerpt}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                            {featured.date} · {featured.readTime} min de leitura
                          </span>
                          <span style={{ color: "#4361EE", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            Ler artigo <ChevronRight size={16} />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              )}

              {/* Rest */}
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#64748b", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Todos os artigos
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {rest.map((article) => (
                  <Link
                    key={article.slug}
                    href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                    style={{ display: "block", textDecoration: "none" }}
                  >
                    <article
                      style={{
                        backgroundColor: "white",
                        borderRadius: "1rem",
                        padding: "1.5rem",
                        border: "1px solid rgba(0,0,0,0.06)",
                        display: "flex",
                        gap: "1.25rem",
                        alignItems: "flex-start",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: "5rem",
                          height: "5rem",
                          flexShrink: 0,
                          borderRadius: "0.75rem",
                          background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: `${article.categoryColor}25`,
                            color: article.categoryColor,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.625rem",
                            fontWeight: 700,
                          }}
                        >
                          {article.category.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0d1b2a", lineHeight: 1.4, marginBottom: "0.375rem" }}>
                          {article.title}
                        </h3>
                        <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6, marginBottom: "0.625rem" }}>
                          {article.excerpt}
                        </p>
                        <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                          {article.date} · {article.readTime} min
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Search */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    backgroundColor: "#f0f4f8",
                    borderRadius: "0.625rem",
                    padding: "0.625rem 1rem",
                  }}
                >
                  <Search size={16} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder={t("search")}
                    style={{
                      border: "none",
                      background: "none",
                      outline: "none",
                      fontSize: "0.875rem",
                      color: "#0d1b2a",
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <h3 style={{ fontWeight: 700, color: "#0d1b2a", marginBottom: "1rem", fontSize: "0.9375rem" }}>
                  {t("tags")}
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: "#f0f4f8",
                        color: "#475569",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subscribe CTA */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  color: "white",
                }}
              >
                <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem" }}>
                  ✍️ Assine a Mea Sententia
                </h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Perspectivas sobre Marketing, Growth e IA direto no seu e-mail.
                </p>
                <NewsletterForm compact />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
