import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NewsletterForm } from "@/components/NewsletterForm";
import { createClient } from "@/lib/supabase/server";
import { ArticlesExplorer } from "./ArticlesExplorer";
import type { Article, Category, Tag, Author } from "@/types/database.types";

export const revalidate = 300;

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
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [articlesRes, categoriesRes, tagsRes, authorsRes] = await Promise.all([
    client.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false }),
    client.from("categories").select("*"),
    client.from("tags").select("*"),
    client.from("authors").select("*").eq("status", "active").order("order"),
  ]);

  const articles = (articlesRes.data ?? []) as Article[];
  const categories = (categoriesRes.data ?? []) as Category[];
  const tags = (tagsRes.data ?? []) as Tag[];
  const authors = (authorsRes.data ?? []) as Author[];

  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 4);

  const latestByAuthor = new Map<string, Article>();
  for (const a of articles) {
    if (a.author_id && !latestByAuthor.has(a.author_id)) latestByAuthor.set(a.author_id, a);
  }

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
            CONTEÚDO
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}
          >
            Notícias e opinião
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

      {/* Columnists strip */}
      {authors.length > 0 && (
        <section style={{ backgroundColor: "var(--site-bg)", borderTop: "2px solid #4361EE", borderBottom: "1px solid var(--site-border)" }}>
          <div
            className="container-xl"
            style={{ display: "flex", justifyContent: "center", gap: "2rem", padding: "1.5rem 0", flexWrap: "wrap", overflowX: "auto" }}
          >
            {authors.map((author) => {
              const latest = latestByAuthor.get(author.id);
              return (
                <Link
                  key={author.id}
                  href={{ pathname: "/mea-sententia/autor/[slug]", params: { slug: author.slug } }}
                  style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", textDecoration: "none", width: "260px" }}
                >
                  <div
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      borderRadius: "0.375rem",
                      flexShrink: 0,
                      background: author.photo_url ? `url(${author.photo_url}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.875rem", color: "#4361EE", marginBottom: "0.25rem" }}>{author.name}</div>
                    <div
                      style={{
                        color: "var(--site-text-secondary)",
                        fontSize: "0.75rem",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {author.tagline_pt?.trim() || (latest ? latest.title_pt : author.role_pt)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl">
          {articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--site-faint)" }}>
              Nenhum artigo publicado ainda. Volte em breve.
            </div>
          ) : (
            <ArticlesExplorer
              articles={articles}
              categories={categories}
              tags={tags}
              mostRead={mostRead}
              searchPlaceholder={t("search")}
              noResultsText={t("noResults")}
              tagsLabel={t("tags")}
            />
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .mea-sententia-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
