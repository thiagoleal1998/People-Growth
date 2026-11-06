import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ColumnistCarousel } from "@/components/ColumnistCarousel";
import { createClient } from "@/lib/supabase/server";
import { pickLocale } from "@/lib/locale-content";
import { isColumnistPubliclyVisible } from "@/lib/founder-data";
import { ArticlesExplorer } from "./ArticlesExplorer";
import type { Article, Category, Tag, Columnist } from "@/types/database.types";

export const revalidate = 300;

// Same Fisher-Yates used by the home page's own columnist strip (page.tsx) —
// a different order each time this page revalidates, rather than always the
// same handful first.
function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

export default async function MeaSententiePage() {
  const t = await getTranslations("newsletter");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [articlesRes, categoriesRes, tagsRes, columnistsRes, extraCategoriesRes] = await Promise.all([
    client.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false }),
    client.from("categories").select("*"),
    client.from("tags").select("*"),
    client.from("columnists").select("*").eq("status", "active").order("order"),
    client.from("article_categories").select("article_id, category_id"),
  ]);

  const articles = (articlesRes.data ?? []) as Article[];
  const categories = (categoriesRes.data ?? []) as Category[];
  const tags = (tagsRes.data ?? []) as Tag[];
  const columnists = ((columnistsRes.data ?? []) as Columnist[]).filter(isColumnistPubliclyVisible);

  // Categories shown in the sidebar: same "must have a published article" rule as the
  // home bar and /conteudo/categorias — counting both an article's primary category
  // and any additional ones (article_categories).
  const publishedIds = new Set(articles.map((a) => a.id));
  const categoryIdsWithArticles = new Set(articles.flatMap((a) => (a.category_id ? [a.category_id] : [])));
  for (const row of (extraCategoriesRes.data ?? []) as { article_id: string; category_id: string }[]) {
    if (publishedIds.has(row.article_id)) categoryIdsWithArticles.add(row.category_id);
  }
  const categoriesWithArticles = categories
    .filter((c) => categoryIdsWithArticles.has(c.id))
    .sort((a, b) => pickLocale(locale, a.name_pt, a.name_en).localeCompare(pickLocale(locale, b.name_pt, b.name_en), locale));

  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 4);

  const latestByColumnist = new Map<string, Article>();
  for (const a of articles) {
    if (a.columnist_id && !latestByColumnist.has(a.columnist_id)) latestByColumnist.set(a.columnist_id, a);
  }
  // Same card-building logic as the home page's own strip — a shuffled-order
  // carousel paging through everyone, instead of dumping the full list flat
  // in one go.
  const columnistCards = shuffled(columnists).map((columnist) => ({
    id: columnist.id,
    slug: columnist.slug,
    name: columnist.name,
    photoUrl: columnist.photo_url,
    blurb:
      pickLocale(locale, columnist.tagline_pt, columnist.tagline_en)?.trim() ||
      (() => {
        const latest = latestByColumnist.get(columnist.id);
        return latest ? pickLocale(locale, latest.title_pt, latest.title_en) : pickLocale(locale, columnist.role_pt, columnist.role_en);
      })(),
  }));

  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)",
          paddingTop: "6rem",
          paddingBottom: "3.5rem",
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
            {t("heroBadge")}
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}
          >
            {t("heroTitle")}
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

      {/* Columnists strip — same paged carousel as the home page, instead of
          dumping every columnist flat in one unpaginated row. */}
      {columnistCards.length > 0 && (
        <section className="columnist-section" style={{ backgroundColor: "var(--site-bg)", borderTop: "2px solid #315E9C", borderBottom: "1px solid var(--site-border)" }}>
          <div className="container-xl" style={{ padding: "1.25rem 0", maxWidth: "1180px", margin: "0 auto" }}>
            <ColumnistCarousel cards={columnistCards} />
            {columnistCards.length > 4 && (
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <Link href="/conteudo/colunistas" style={{ color: "#315E9C", fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none" }}>
                  {tc("seeAll")} →
                </Link>
              </div>
            )}
          </div>
          {/* Phones get a horizontal swipe row of tall cards instead of a
              stacked list of small rows — the photo becomes the card. Same
              block as the home page's own columnist strip. */}
          <style>{`
            @media (max-width: 768px) { .columnist-section { overflow-x: hidden; } }
            .columnist-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
              gap: 1.5rem 2rem;
            }
            @media (max-width: 768px) {
              .columnist-grid {
                display: flex;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                scroll-padding-left: 1.5rem;
                gap: 1.5rem;
                margin: 0 -1rem;
                padding: 0 1.5rem 0.5rem;
                scrollbar-width: none;
              }
              .columnist-grid::-webkit-scrollbar { display: none; }
              .columnist-card {
                flex: 0 0 38%;
                flex-direction: column !important;
                gap: 0.625rem !important;
                scroll-snap-align: start;
              }
              .columnist-photo {
                width: 100% !important;
                height: auto !important;
                aspect-ratio: 1 / 1;
                border-radius: 0.75rem !important;
              }
              .columnist-text { width: 100%; }
            }
          `}</style>
        </section>
      )}

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl">
          {articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--site-faint)" }}>
              {t("empty")}
            </div>
          ) : (
            <ArticlesExplorer
              articles={articles}
              categories={categories}
              categoriesWithArticles={categoriesWithArticles}
              tags={tags}
              columnists={columnists}
              mostRead={mostRead}
              searchPlaceholder={t("search")}
              noResultsText={t("noResults")}
              tagsLabel={t("tags")}
              categoriesLabel={t("categories")}
            />
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .conteudo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
