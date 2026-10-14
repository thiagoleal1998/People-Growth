import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { FormatTag } from "@/components/FormatTag";
import { PEOPLE_GROWTH_LOGO_URL } from "@/lib/brand-logos";
import { createClient } from "@/lib/supabase/server";
import { articleHref } from "@/lib/article-url";
import { pickLocale } from "@/lib/locale-content";
import type { Article, Author, Category } from "@/types/database.types";

export const revalidate = 300;

// People & Growth is the restricted sub-brand inside the Festina site — leadership,
// personal development content, and the consulting business — aggregated here from
// every category an admin has flagged with is_people_growth (CategoriesManager), the
// same category-driven pattern as /conteudo/categoria/[slug] rather than a one-off list.
async function getPeopleGrowthData() {
  const supabase = await createClient();
  const client = supabase as any;

  const { data: categoriesData } = await client.from("categories").select("*");
  const allCategories = (categoriesData ?? []) as Category[];
  const pgCategories = allCategories.filter((c) => c.is_people_growth);
  const pgCategoryIds = pgCategories.map((c) => c.id);

  if (pgCategoryIds.length === 0) {
    return { categories: [], articles: [], authorById: new Map<string, Author>(), categoryById: new Map<string, Category>() };
  }

  const [{ data: primaryData }, { data: extraRows }, { data: authorsData }] = await Promise.all([
    client
      .from("articles")
      .select("*")
      .in("category_id", pgCategoryIds)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    client.from("article_categories").select("article_id").in("category_id", pgCategoryIds),
    client.from("authors").select("*"),
  ]);

  const extraIds = ((extraRows ?? []) as { article_id: string }[]).map((row) => row.article_id);
  const { data: extraData } =
    extraIds.length > 0 ? await client.from("articles").select("*").in("id", extraIds).eq("status", "published") : { data: [] };

  const byId = new Map<string, Article>();
  for (const article of [...((primaryData ?? []) as Article[]), ...((extraData ?? []) as Article[])]) byId.set(article.id, article);
  const articles = [...byId.values()].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));

  return {
    categories: pgCategories,
    articles,
    authorById: new Map(((authorsData ?? []) as Author[]).map((a) => [a.id, a])),
    categoryById: new Map(allCategories.map((c) => [c.id, c])),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "People & Growth" : "People & Growth",
    description:
      locale === "en"
        ? "Leadership, personal development and our consulting practice — the People & Growth brand inside the Festina group."
        : "Liderança, desenvolvimento pessoal e nossa consultoria — a marca People & Growth dentro do grupo Festina.",
  };
}

export default async function PeopleGrowthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { articles, authorById, categoryById } = await getPeopleGrowthData();
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)", paddingTop: "6rem", paddingBottom: "3.5rem", color: "white" }}>
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
            <img src={PEOPLE_GROWTH_LOGO_URL} alt="People & Growth" style={{ height: "4rem", width: "auto", display: "block", objectFit: "contain" }} />
          </div>
          <span
            style={{
              display: "inline-block",
              backgroundColor: "rgba(200,154,74,0.15)",
              color: "#C89A4A",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            {locale === "en" ? "A FESTINA BRAND" : "UMA MARCA FESTINA"}
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>People &amp; Growth</h1>
          <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
            {locale === "en"
              ? "Content on leadership and personal development, plus our strategy, growth and AI consulting practice for businesses."
              : "Conteúdo sobre liderança e desenvolvimento pessoal, além da nossa consultoria em estratégia, growth e IA para negócios."}
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface)" }}>
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              backgroundColor: "rgba(200,154,74,0.08)",
              border: "1px solid rgba(200,154,74,0.25)",
              borderRadius: "1rem",
              padding: "1.5rem 1.75rem",
              marginBottom: "2.5rem",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", marginBottom: "0.25rem" }}>
                {locale === "en" ? "Looking for consulting?" : "Procurando consultoria?"}
              </div>
              <div style={{ fontSize: "0.9375rem", color: "var(--site-muted)" }}>
                {locale === "en" ? "Talk to us about strategy, growth and AI for your business." : "Fale com a gente sobre estratégia, growth e IA para o seu negócio."}
              </div>
            </div>
            <Link
              href="/contato"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                backgroundColor: "#C89A4A",
                color: "#0d1b2a",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.625rem",
                fontWeight: 700,
                fontSize: "0.9375rem",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {locale === "en" ? "Get in touch" : "Fale com a gente"} <ArrowRight size={16} />
            </Link>
          </div>

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
                        background: article.cover_image ? `url("${article.cover_image}") center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
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
