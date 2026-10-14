import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { articleHref } from "@/lib/article-url";
import { pickLocale } from "@/lib/locale-content";
import { MEA_SENTENTIA_LOGO_URL } from "@/lib/brand-logos";
import type { Article, Author, Category } from "@/types/database.types";

export const revalidate = 300;

// Mea Sententia is the third Festina brand — unlike People & Growth and Ponto
// de Réplica (flagged by category), it's defined by article FORMAT
// (format: "opiniao"), set per-article regardless of category. /conteudo
// used to live at this URL but mixed opinion with regular news, which is why
// it moved away (see next.config.ts) — this page is the real "just the
// opinion column" listing that was missing since then.
async function getMeaSententiaData() {
  const supabase = await createClient();
  const client = supabase as any;

  const [{ data: articlesData }, { data: categoriesData }, { data: authorsData }] = await Promise.all([
    client.from("articles").select("*").eq("format", "opiniao").eq("status", "published").order("published_at", { ascending: false }),
    client.from("categories").select("*"),
    client.from("authors").select("*"),
  ]);

  return {
    articles: (articlesData ?? []) as Article[],
    categoryById: new Map(((categoriesData ?? []) as Category[]).map((c) => [c.id, c])),
    authorById: new Map(((authorsData ?? []) as Author[]).map((a) => [a.id, a])),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Mea Sententia",
    description:
      locale === "en"
        ? "Opinion column — perspectives on business, society and the issues shaping the current moment. The Mea Sententia brand inside the Festina group."
        : "Coluna de opinião — perspectivas sobre negócios, sociedade e os temas que moldam o momento atual. A marca Mea Sententia dentro do grupo Festina.",
  };
}

export default async function MeaSententiaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { articles, categoryById, authorById } = await getMeaSententiaData();
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #2b2208 0%, #3d2f0c 100%)", paddingTop: "6rem", paddingBottom: "3.5rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "0.625rem 1.125rem",
              marginBottom: "1.5rem",
            }}
          >
            <img src={MEA_SENTENTIA_LOGO_URL} alt="Mea Sententia" style={{ height: "2.5rem", width: "auto", display: "block", objectFit: "contain" }} />
          </div>
          <span
            style={{
              display: "inline-block",
              backgroundColor: "rgba(255,183,3,0.18)",
              color: "#ffcf4d",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            {locale === "en" ? "A FESTINA BRAND" : "UMA MARCA FESTINA"}
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>Mea Sententia</h1>
          <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
            {locale === "en"
              ? "Our opinion column — perspectives on business, society and the issues shaping the current moment."
              : "Nossa coluna de opinião — perspectivas sobre negócios, sociedade e os temas que moldam o momento atual."}
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface)" }}>
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              {locale === "en" ? "No articles published here yet." : "Nenhum artigo publicado aqui ainda."}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={articleHref(article, article.category_id ? categoryById.get(article.category_id)?.slug : null)}
                  style={{ display: "block", textDecoration: "none" }}
                  className="hover-card"
                >
                  <article style={{ backgroundColor: "var(--site-card)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--site-border)", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "5rem",
                        height: "5rem",
                        flexShrink: 0,
                        borderRadius: "0.75rem",
                        background: article.cover_image ? `url("${article.cover_image}") center/cover` : "linear-gradient(135deg, #2b2208, #3d2f0c)",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: "0.375rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.6875rem",
                            fontWeight: 800,
                            letterSpacing: "0.03em",
                            textTransform: "uppercase",
                            color: "#b8860b",
                            backgroundColor: "rgba(255,183,3,0.15)",
                            padding: "0.1875rem 0.5rem",
                            borderRadius: "0.25rem",
                          }}
                        >
                          Mea Sententia
                        </span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.375rem" }}>
                        {pickLocale(locale, article.title_pt, article.title_en)}
                      </h3>
                      {article.excerpt_pt && (
                        <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", lineHeight: 1.6, marginBottom: "0.625rem" }}>
                          {pickLocale(locale, article.excerpt_pt, article.excerpt_en)}
                        </p>
                      )}
                      {(article.author_id || article.published_at) && (
                        <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)" }}>
                          {article.author_id && authorById.get(article.author_id) && <>{tc("by")} {authorById.get(article.author_id)!.name} · </>}
                          {article.published_at && new Date(article.published_at).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
