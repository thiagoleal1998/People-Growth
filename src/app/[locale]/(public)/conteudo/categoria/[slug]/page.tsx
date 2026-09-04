import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { FormatTag } from "@/components/FormatTag";
import { createClient } from "@/lib/supabase/server";
import type { Article, Category } from "@/types/database.types";

export const revalidate = 300;

async function getCategoryData(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: category } = await client.from("categories").select("*").eq("slug", slug).single();
  if (!category) return null;

  const { data: articlesData } = await client
    .from("articles")
    .select("*")
    .eq("category_id", category.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return { category: category as Category, articles: (articlesData ?? []) as Article[] };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCategoryData(slug);
  if (!result) return { title: "Categoria não encontrada" };
  return {
    title: `${result.category.name_pt} — Conteúdo`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getCategoryData(slug);

  if (!result) notFound();

  const { category, articles } = result;

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)", paddingTop: "6rem", paddingBottom: "3.5rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <Link href="/conteudo" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> Conteúdo
          </Link>
          <span
            style={{
              display: "inline-block",
              backgroundColor: `${category.color ?? "#4361EE"}25`,
              color: category.color ?? "#4361EE",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            CATEGORIA
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1 }}>{category.name_pt}</h1>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              Nenhum artigo publicado em {category.name_pt} ainda.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={{ pathname: "/conteudo/[slug]", params: { slug: article.slug } }}
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
                        background: article.cover_image ? `url(${article.cover_image}) center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                      }}
                    />
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
                      {article.published_at && (
                        <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)" }}>
                          {new Date(article.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
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
