import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FormatTag } from "@/components/FormatTag";
import { createClient } from "@/lib/supabase/server";
import { articleHref } from "@/lib/article-url";
import { pickLocale } from "@/lib/locale-content";
import { PONTO_DE_REPLICA_LOGO_URL } from "@/lib/brand-logos";
import type { Article, Author, Category } from "@/types/database.types";

export const revalidate = 300;

// Ponto de Réplica is the second restricted sub-brand inside the Festina site —
// política, economia e sociedade — aggregated from every category an admin has
// flagged with is_ponto_de_replica (CategoriesManager). Same shape as
// /people-growth/page.tsx, minus the consulting CTA (this sub-brand has no
// business/services angle, unlike People & Growth).
async function getPontoDeReplicaData() {
  const supabase = await createClient();
  const client = supabase as any;

  const { data: categoriesData } = await client.from("categories").select("*");
  const allCategories = (categoriesData ?? []) as Category[];
  const prCategories = allCategories.filter((c) => c.is_ponto_de_replica);
  const prCategoryIds = prCategories.map((c) => c.id);

  if (prCategoryIds.length === 0) {
    return { categories: [], articles: [], authorById: new Map<string, Author>(), categoryById: new Map<string, Category>() };
  }

  const [{ data: primaryData }, { data: extraRows }, { data: authorsData }] = await Promise.all([
    client
      .from("articles")
      .select("*")
      .in("category_id", prCategoryIds)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    client.from("article_categories").select("article_id").in("category_id", prCategoryIds),
    client.from("authors").select("*"),
  ]);

  const extraIds = ((extraRows ?? []) as { article_id: string }[]).map((row) => row.article_id);
  const { data: extraData } =
    extraIds.length > 0 ? await client.from("articles").select("*").in("id", extraIds).eq("status", "published") : { data: [] };

  const byId = new Map<string, Article>();
  for (const article of [...((primaryData ?? []) as Article[]), ...((extraData ?? []) as Article[])]) byId.set(article.id, article);
  const articles = [...byId.values()].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));

  return {
    categories: prCategories,
    articles,
    authorById: new Map(((authorsData ?? []) as Author[]).map((a) => [a.id, a])),
    categoryById: new Map(allCategories.map((c) => [c.id, c])),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Ponto de Réplica",
    description:
      locale === "en"
        ? "Politics, economy and society — the Ponto de Réplica brand inside the Festina group."
        : "Política, economia e sociedade — a marca Ponto de Réplica dentro do grupo Festina.",
  };
}

export default async function PontoDeReplicaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { articles, authorById, categoryById } = await getPontoDeReplicaData();
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #1c1430 0%, #2a1f42 100%)", paddingTop: "6rem", paddingBottom: "3.5rem", color: "white" }}>
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
            <img src={PONTO_DE_REPLICA_LOGO_URL} alt="Ponto de Réplica" style={{ height: "4rem", width: "auto", display: "block", objectFit: "contain" }} />
          </div>
          <span
            style={{
              display: "inline-block",
              backgroundColor: "rgba(170,140,210,0.18)",
              color: "#c9adea",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            {locale === "en" ? "A FESTINA BRAND" : "UMA MARCA FESTINA"}
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>Ponto de Réplica</h1>
          <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
            {locale === "en"
              ? "Independent coverage of politics, economy and society — the issues shaping the current moment."
              : "Cobertura independente de política, economia e sociedade — os temas que moldam o momento atual."}
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
                        background: article.cover_image ? `url("${article.cover_image}") center/cover` : "linear-gradient(135deg, #1c1430, #2a1f42)",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: "0.375rem" }}>
                        <FormatTag format={article.format} locale={locale} />
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
