import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Search, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { articleHref } from "@/lib/article-url";
import { pickLocale } from "@/lib/locale-content";
import type { Article, Author, Category } from "@/types/database.types";

type ArticleWithCategory = Article & { categories: Pick<Category, "slug"> | null };

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Busca por "${q}"` : "Buscar", robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const locale = await getLocale();
  const tc = await getTranslations("common");

  let results: ArticleWithCategory[] = [];
  let authorById = new Map<string, Author>();
  if (query) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const [{ data }, { data: authorsData }] = await Promise.all([
      client
        .from("articles")
        .select("*, categories(slug)")
        .eq("status", "published")
        .or(`title_pt.ilike.%${query}%,excerpt_pt.ilike.%${query}%,content_pt.ilike.%${query}%,title_en.ilike.%${query}%,excerpt_en.ilike.%${query}%,content_en.ilike.%${query}%`)
        .order("published_at", { ascending: false })
        .limit(30),
      client.from("authors").select("*"),
    ]);
    results = (data ?? []) as ArticleWithCategory[];
    authorById = new Map(((authorsData ?? []) as Author[]).map((a) => [a.id, a]));
  }

  return (
    <div className="section-padding">
      <div className="container-xl" style={{ maxWidth: "800px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
          <Search size={22} color="#4361EE" />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--site-text)" }}>
            {query ? (locale === "en" ? `Results for "${query}"` : `Resultados para "${query}"`) : (locale === "en" ? "Search" : "Buscar")}
          </h1>
        </div>
        {query && (
          <p style={{ color: "var(--site-muted)", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            {results.length}{" "}
            {locale === "en"
              ? `result${results.length === 1 ? "" : "s"} found`
              : `resultado${results.length === 1 ? "" : "s"} encontrado${results.length === 1 ? "" : "s"}`}
          </p>
        )}

        {!query && (
          <p style={{ color: "var(--site-muted)" }}>
            {locale === "en" ? "Use the search at the top of the site to find articles." : "Use a busca no topo do site para encontrar artigos."}
          </p>
        )}

        {query && results.length === 0 && (
          <p style={{ color: "var(--site-muted)" }}>
            {locale === "en" ? "No results found. Try other terms." : "Nenhum resultado encontrado. Tente outros termos."}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {results.map((article) => (
            <Link
              key={article.id}
              href={articleHref(article, article.categories?.slug)}
              className="hover-card"
              style={{
                display: "flex",
                gap: "1.25rem",
                textDecoration: "none",
                padding: "1rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--site-border)",
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "90px",
                  flexShrink: 0,
                  borderRadius: "0.5rem",
                  background: article.cover_image ? `url(${article.cover_image}) center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                }}
              />
              <div>
                <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--site-text)", marginBottom: "0.375rem", lineHeight: 1.35 }}>
                  {pickLocale(locale, article.title_pt, article.title_en)}
                </h2>
                {article.excerpt_pt && (
                  <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", lineHeight: 1.5, marginBottom: "0.5rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {pickLocale(locale, article.excerpt_pt, article.excerpt_en)}
                  </p>
                )}
                {(article.author_id || article.published_at) && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3125rem", fontSize: "0.75rem", color: "var(--site-faint)" }}>
                    <Calendar size={12} />
                    {article.author_id && authorById.get(article.author_id) && <>{tc("by")} {authorById.get(article.author_id)!.name} · </>}
                    {article.published_at && new Date(article.published_at).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
