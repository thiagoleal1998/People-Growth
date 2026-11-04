import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight, Newspaper } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickLocale } from "@/lib/locale-content";
import type { Category } from "@/types/database.types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Categorias — Festina",
};

// The bar on every page only ever shows a handful of categories (see CategoryNav);
// this page is where the rest — and, here, every category with at least one
// published article — can be reached.
type LatestArticle = { title_pt: string; title_en: string | null; cover_image: string | null };

export default async function CategoriasPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: categoriesData }, { data: articlesData }, { data: extraData }] = await Promise.all([
    client.from("categories").select("*"),
    client
      .from("articles")
      .select("id, category_id, title_pt, title_en, cover_image, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    client.from("article_categories").select("article_id, category_id"),
  ]);
  const categories = (categoriesData ?? []) as Category[];
  const published = (articlesData ?? []) as {
    id: string;
    category_id: string | null;
    title_pt: string;
    title_en: string | null;
    cover_image: string | null;
    published_at: string | null;
  }[];
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
  // Each card's teaser is the most recent article whose PRIMARY category is
  // this one (not the secondary/extra links above) — `published` already
  // comes back newest-first, so the first match per category wins.
  const latestByCategory = new Map<string, LatestArticle>();
  for (const article of published) {
    if (article.category_id && !latestByCategory.has(article.category_id)) {
      latestByCategory.set(article.category_id, article);
    }
  }
  // Sorted by how active the section actually is, not alphabetically — the
  // busiest beats reads first, like a real section front rather than a
  // phone book.
  const withArticles = categories
    .filter((category) => counts.has(category.id))
    .sort((a, b) => (counts.get(b.id)?.size ?? 0) - (counts.get(a.id)?.size ?? 0));

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)", paddingTop: "6rem", paddingBottom: "3.5rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "760px" }}>
          <Link href="/conteudo" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> {locale === "en" ? "Content" : "Conteúdo"}
          </Link>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "0.875rem" }}>
            {locale === "en" ? "Categories" : "Categorias"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", lineHeight: 1.7, maxWidth: "540px" }}>
            {locale === "en"
              ? "Every section we cover, ranked by what's most active right now."
              : "Todos os temas que cobrimos, ordenados pelo que está mais ativo agora."}
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "1120px" }}>
          {withArticles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              {locale === "en" ? "No categories with published articles yet." : "Nenhuma categoria com artigos publicados ainda."}
            </div>
          ) : (
            <div className="categories-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: "1.5rem" }}>
              {withArticles.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  count={counts.get(category.id)?.size ?? 0}
                  latest={latestByCategory.get(category.id)}
                  locale={locale}
                  featured={index === 0}
                />
              ))}
            </div>
          )}
        </div>
        <style>{`
          @media (max-width: 720px) {
            .category-card { flex-direction: column !important; }
            .category-card > div:first-child { flex: none !important; aspect-ratio: 16 / 10 !important; min-height: 0 !important; }
          }
        `}</style>
      </section>
    </>
  );
}

function CategoryCard({
  category,
  count,
  latest,
  locale,
  featured,
}: {
  category: Category;
  count: number;
  latest: LatestArticle | undefined;
  locale: string;
  featured: boolean;
}) {
  const color = category.color ?? "#315E9C";
  const name = pickLocale(locale, category.name_pt, category.name_en);
  const latestTitle = latest ? pickLocale(locale, latest.title_pt, latest.title_en) : null;

  return (
    <Link
      href={{ pathname: "/conteudo/categoria/[slug]", params: { slug: category.slug } }}
      className="hover-card category-card"
      style={{
        gridColumn: featured ? "span 2" : undefined,
        display: "flex",
        flexDirection: featured ? "row" : "column",
        borderRadius: "1.25rem",
        overflow: "hidden",
        backgroundColor: "var(--site-card)",
        border: "1px solid var(--site-border)",
        textDecoration: "none",
        height: "100%",
      }}
    >
      {/* Image teaser when the section's latest article has a cover photo;
          otherwise a tinted wash in the category's own color with a giant
          faint initial, so an empty section still reads as a designed
          "section front" tile rather than a placeholder box. */}
      <div
        style={{
          position: "relative",
          flex: featured ? "0 0 42%" : undefined,
          aspectRatio: featured ? undefined : "16 / 10",
          minHeight: featured ? "100%" : undefined,
          overflow: "hidden",
          backgroundColor: `${color}14`,
        }}
      >
        {latest?.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={latest.cover_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          // Flat and fully-saturated, not a pale wash of the color — this is
          // the only thing behind the white badge/title text on a section
          // with no photo yet, so it needs the same contrast a real photo's
          // dark gradient would give.
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, ${color}, ${color}d8)`,
            }}
          >
            <span style={{ fontSize: "4.5rem", fontWeight: 800, color: "rgba(255,255,255,0.3)", lineHeight: 1 }}>{name.charAt(0)}</span>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,27,42,0.82) 0%, rgba(13,27,42,0.15) 55%, transparent 80%)" }} />
        <span
          style={{
            position: "absolute",
            left: "1.125rem",
            bottom: "1.125rem",
            right: "1.125rem",
            color: "white",
            fontWeight: 800,
            fontSize: featured ? "clamp(1.375rem, 2.2vw, 1.75rem)" : "1.1875rem",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {name}
        </span>
        <span
          style={{
            position: "absolute",
            top: "1rem",
            left: "1.125rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.25rem 0.625rem",
            borderRadius: "9999px",
            fontSize: "0.6875rem",
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "white",
            backgroundColor: `${color}cc`,
            backdropFilter: "blur(4px)",
          }}
        >
          <Newspaper size={11} />
          {count} {locale === "en" ? (count === 1 ? "article" : "articles") : count === 1 ? "artigo" : "artigos"}
        </span>
      </div>

      <div style={{ padding: "1.125rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flex: featured ? 1 : undefined }}>
        <div style={{ minWidth: 0 }}>
          {latestTitle ? (
            <p style={{ fontSize: "0.875rem", color: "var(--site-text-secondary)", lineHeight: 1.45, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: featured ? 3 : 2, WebkitBoxOrient: "vertical" }}>
              {latestTitle}
            </p>
          ) : (
            <p style={{ fontSize: "0.875rem", color: "var(--site-faint)", margin: 0 }}>
              {locale === "en" ? "Browse this section" : "Explorar esta seção"}
            </p>
          )}
        </div>
        <span className="hover-link-move" style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "9999px", backgroundColor: `${color}16`, color }}>
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
