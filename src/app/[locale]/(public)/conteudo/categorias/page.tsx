import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickLocale } from "@/lib/locale-content";
import type { Category } from "@/types/database.types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Categorias — People & Growth",
};

// The bar on every page only ever shows a handful of categories (see CategoryNav);
// this page is where the rest — and, here, every category with at least one
// published article — can be reached.
export default async function CategoriasPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: categoriesData }, { data: articlesData }, { data: extraData }] = await Promise.all([
    client.from("categories").select("*"),
    client.from("articles").select("id, category_id").eq("status", "published"),
    client.from("article_categories").select("article_id, category_id"),
  ]);
  const categories = (categoriesData ?? []) as Category[];
  const published = (articlesData ?? []) as { id: string; category_id: string | null }[];
  const publishedIds = new Set(published.map((a) => a.id));
  // One article can count for more than one category now (its primary one, plus any
  // additional categories from article_categories), so each category's count is the
  // number of distinct published articles listed under it, not the number of rows.
  const counts = new Map<string, Set<string>>();
  const addToCategory = (categoryId: string, articleId: string) => {
    if (!counts.has(categoryId)) counts.set(categoryId, new Set());
    counts.get(categoryId)!.add(articleId);
  };
  for (const article of published) {
    if (article.category_id) addToCategory(article.category_id, article.id);
  }
  for (const row of (extraData ?? []) as { article_id: string; category_id: string }[]) {
    if (publishedIds.has(row.article_id)) addToCategory(row.category_id, row.article_id);
  }
  const withArticles = categories
    .filter((category) => counts.has(category.id))
    .sort((a, b) => pickLocale(locale, a.name_pt, a.name_en).localeCompare(pickLocale(locale, b.name_pt, b.name_en), locale));

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)", paddingTop: "6rem", paddingBottom: "3.5rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <Link href="/conteudo" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> {locale === "en" ? "Content" : "Conteúdo"}
          </Link>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1 }}>{locale === "en" ? "Categories" : "Categorias"}</h1>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          {withArticles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              {locale === "en" ? "No categories with published articles yet." : "Nenhuma categoria com artigos publicados ainda."}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))", gap: "1rem" }}>
              {withArticles.map((category) => {
                const count = counts.get(category.id)?.size ?? 0;
                return (
                <Link
                  key={category.id}
                  href={{ pathname: "/conteudo/categoria/[slug]", params: { slug: category.slug } }}
                  className="hover-card"
                  style={{
                    display: "block",
                    padding: "1.25rem 1.5rem",
                    borderRadius: "1rem",
                    backgroundColor: "var(--site-card)",
                    border: "1px solid var(--site-border)",
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: `${category.color ?? "#4361EE"}25`,
                      color: category.color ?? "#4361EE",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {pickLocale(locale, category.name_pt, category.name_en)}
                  </span>
                  <div style={{ fontSize: "0.8125rem", color: "var(--site-muted)" }}>
                    {count} {locale === "en" ? (count === 1 ? "article" : "articles") : count === 1 ? "artigo" : "artigos"}
                  </div>
                </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
