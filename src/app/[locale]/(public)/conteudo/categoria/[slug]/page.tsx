import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { FormatTag } from "@/components/FormatTag";
import { PeopleGrowthBadge } from "@/components/PeopleGrowthBadge";
import { PontoDeReplicaBadge } from "@/components/PontoDeReplicaBadge";
import { createClient } from "@/lib/supabase/server";
import { articleHref } from "@/lib/article-url";
import { pickLocale } from "@/lib/locale-content";
import type { Article, Columnist, Category } from "@/types/database.types";

export const revalidate = 300;

async function getCategoryData(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: category } = await client.from("categories").select("*").eq("slug", slug).single();
  if (!category) return null;

  // An article lists here either because this is its primary category, or because
  // it was additionally tagged with it (article_categories) — merged and de-duped
  // below, since the same article could in principle match both.
  const [{ data: primaryData }, { data: extraRows }, { data: columnistsData }, { data: allCategoriesData }] = await Promise.all([
    client
      .from("articles")
      .select("*")
      .eq("category_id", category.id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    client.from("article_categories").select("article_id").eq("category_id", category.id),
    client.from("columnists").select("*"),
    client.from("categories").select("*"),
  ]);

  const extraIds = ((extraRows ?? []) as { article_id: string }[]).map((row) => row.article_id);
  const { data: extraData } =
    extraIds.length > 0 ? await client.from("articles").select("*").in("id", extraIds).eq("status", "published") : { data: [] };

  const byId = new Map<string, Article>();
  for (const article of [...((primaryData ?? []) as Article[]), ...((extraData ?? []) as Article[])]) byId.set(article.id, article);
  const articles = [...byId.values()].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));

  return {
    category: category as Category,
    articles,
    columnistById: new Map(((columnistsData ?? []) as Columnist[]).map((a) => [a.id, a])),
    categoryById: new Map(((allCategoriesData ?? []) as Category[]).map((c) => [c.id, c])),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const result = await getCategoryData(slug);
  if (!result) return { title: "Categoria não encontrada" };
  return {
    title: `${pickLocale(locale, result.category.name_pt, result.category.name_en)} — ${locale === "en" ? "Content" : "Conteúdo"}`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  // /esportes absorbed this category's article feed (plus live scores/
  // standings/NFL/NBA) as part of unifying the site's sports pages — this
  // slug alone redirects there instead of rendering the generic template.
  if (slug === "esporte") {
    permanentRedirect(locale === "en" ? "/en/sports?tab=artigos" : "/pt/esportes?tab=artigos");
  }
  const result = await getCategoryData(slug);

  if (!result) notFound();

  const { category, articles, columnistById, categoryById } = result;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)", paddingTop: "6rem", paddingBottom: "3.5rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <Link href="/conteudo" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> {tNav("newsletter")}
          </Link>
          <span
            style={{
              display: "inline-block",
              backgroundColor: `${category.color ?? "#315E9C"}25`,
              color: category.color ?? "#315E9C",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            {locale === "en" ? "CATEGORY" : "CATEGORIA"}
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1 }}>{pickLocale(locale, category.name_pt, category.name_en)}</h1>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "1040px" }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              {locale === "en"
                ? `No articles published in ${pickLocale(locale, category.name_pt, category.name_en)} yet.`
                : `Nenhum artigo publicado em ${category.name_pt} ainda.`}
            </div>
          ) : (
            <>
              <div className="category-articles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={articleHref(article, article.category_id ? categoryById.get(article.category_id)?.slug : null)}
                    style={{ display: "block", textDecoration: "none", height: "100%" }}
                    className="hover-card"
                  >
                    <article style={{ backgroundColor: "var(--site-card)", borderRadius: "1.25rem", border: "1px solid var(--site-border)", boxShadow: "0 1px 2px rgba(13,27,42,0.05)", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                      <div
                        style={{
                          aspectRatio: "16 / 10",
                          background: article.cover_image ? `url("${article.cover_image}") center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                        }}
                      />
                      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ marginBottom: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                          <FormatTag format={article.format} locale={locale} />
                          {category.is_people_growth && <PeopleGrowthBadge />}
                          {category.is_ponto_de_replica && <PontoDeReplicaBadge />}
                        </div>
                        <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.5rem" }}>
                          {pickLocale(locale, article.title_pt, article.title_en)}
                        </h3>
                        {article.excerpt_pt && (
                          <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", lineHeight: 1.6, marginBottom: "0.625rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {pickLocale(locale, article.excerpt_pt, article.excerpt_en)}
                          </p>
                        )}
                        {(article.columnist_id || article.published_at) && (
                          <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)", marginTop: "auto" }}>
                            {article.columnist_id && columnistById.get(article.columnist_id) && <>{tc("by")} {columnistById.get(article.columnist_id)!.name} · </>}
                            {article.published_at && new Date(article.published_at).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
              <style>{`
                @media (max-width: 640px) {
                  .category-articles-grid { grid-template-columns: 1fr !important; }
                }
              `}</style>
            </>
          )}
        </div>
      </section>
    </>
  );
}
