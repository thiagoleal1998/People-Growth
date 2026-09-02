import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Linkedin, Instagram, Mail, ChevronRight } from "lucide-react";
import { FormatTag } from "@/components/FormatTag";
import { createClient } from "@/lib/supabase/server";
import type { Article, Author, Category } from "@/types/database.types";

export const revalidate = 300;

async function getAuthorData(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: author } = await client.from("authors").select("*").eq("slug", slug).eq("status", "active").single();
  if (!author) return null;

  const [{ data: articlesData }, { data: categoriesData }] = await Promise.all([
    client.from("articles").select("*").eq("author_id", author.id).eq("status", "published").order("published_at", { ascending: false }),
    client.from("categories").select("*"),
  ]);

  return {
    author: author as Author,
    articles: (articlesData ?? []) as Article[],
    categories: (categoriesData ?? []) as Category[],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getAuthorData(slug);
  if (!result) return { title: "Autor não encontrado" };
  return {
    title: `${result.author.name} — Conteúdo`,
    description: result.author.role_pt ?? undefined,
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getAuthorData(slug);

  if (!result) notFound();

  const { author, articles, categories } = result;
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <>
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)",
          paddingTop: "6rem",
          paddingBottom: "3.5rem",
          color: "white",
        }}
      >
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <Link
            href="/mea-sententia"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.875rem",
              marginBottom: "2rem",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Conteúdo
          </Link>

          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div
              style={{
                width: "6rem",
                height: "6rem",
                borderRadius: "50%",
                flexShrink: 0,
                background: author.photo_url ? `url(${author.photo_url}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
              }}
            />
            <div style={{ flex: 1, minWidth: "240px" }}>
              <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "0.375rem" }}>
                {author.name}
              </h1>
              {author.role_pt && (
                <p style={{ color: "#06D6A0", fontWeight: 600, fontSize: "1rem", marginBottom: "0.875rem" }}>
                  {author.role_pt}
                </p>
              )}
              {author.bio_pt && (
                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "1rem", maxWidth: "560px" }}>
                  {author.bio_pt}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.875rem" }}>
                {author.linkedin_url && (
                  <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: "rgba(255,255,255,0.6)" }}>
                    <Linkedin size={19} />
                  </a>
                )}
                {author.instagram_url && (
                  <a href={author.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: "rgba(255,255,255,0.6)" }}>
                    <Instagram size={19} />
                  </a>
                )}
                {author.email && (
                  <a href={`mailto:${author.email}`} aria-label="E-mail" style={{ color: "rgba(255,255,255,0.6)" }}>
                    <Mail size={19} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              {author.name} ainda não publicou nenhum artigo.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {articles.map((article) => {
                const cat = article.category_id ? categoryById.get(article.category_id) : null;
                return (
                  <Link
                    key={article.id}
                    href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                    style={{ display: "block", textDecoration: "none" }}
                  >
                    <article
                      style={{
                        backgroundColor: "var(--site-card)",
                        borderRadius: "1rem",
                        padding: "1.5rem",
                        border: "1px solid var(--site-border)",
                        display: "flex",
                        gap: "1.25rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "5rem",
                          height: "5rem",
                          flexShrink: 0,
                          borderRadius: "0.75rem",
                          background: article.cover_image
                            ? `url(${article.cover_image}) center/cover`
                            : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {cat && !article.cover_image && (
                          <span
                            style={{
                              backgroundColor: `${cat.color ?? "#4361EE"}25`,
                              color: cat.color ?? "#4361EE",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.625rem",
                              fontWeight: 700,
                            }}
                          >
                            {cat.name_pt.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: "0.375rem" }}>
                          <FormatTag format={article.format} />
                        </div>
                        <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.375rem" }}>
                          {article.title_pt}
                        </h3>
                        {article.excerpt_pt && (
                          <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", lineHeight: 1.6, marginBottom: "0.625rem" }}>
                            {article.excerpt_pt}
                          </p>
                        )}
                        <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </article>
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
