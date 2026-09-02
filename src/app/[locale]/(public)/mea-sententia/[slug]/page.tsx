import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { FormatTag } from "@/components/FormatTag";
import { ShareButtons } from "@/components/ShareButtons";
import { CommentForm } from "@/components/CommentForm";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import type { Article, Category, Author, Comment } from "@/types/database.types";

export const revalidate = 300;

async function getArticle(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: article } = await client.from("articles").select("*").eq("slug", slug).eq("status", "published").single();
  if (!article) return null;

  const [categoryRes, authorRes, commentsRes] = await Promise.all([
    article.category_id ? client.from("categories").select("*").eq("id", article.category_id).single() : Promise.resolve({ data: null }),
    article.author_id ? client.from("authors").select("*").eq("id", article.author_id).single() : Promise.resolve({ data: null }),
    client.from("comments").select("*").eq("article_id", article.id).eq("status", "approved").order("created_at", { ascending: false }),
  ]);

  return {
    article: article as Article,
    category: categoryRes.data as Category | null,
    author: authorRes.data as Author | null,
    comments: (commentsRes.data ?? []) as Comment[],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticle(slug);
  if (!result) return { title: "Artigo não encontrado" };
  return {
    title: result.article.seo_title_pt || result.article.title_pt,
    description: result.article.seo_desc_pt || result.article.excerpt_pt || undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const result = await getArticle(slug);

  if (!result) notFound();

  const { article, category, author, comments } = result;

  // Fire-and-forget view counter; never block or fail the page render on it.
  createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((admin) => (admin as any).from("articles").update({ views: article.views + 1 }).eq("id", article.id))
    .catch(() => {});

  return (
    <>
      {/* Header */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)",
          paddingTop: "6rem",
          paddingBottom: "4rem",
          color: "white",
        }}
      >
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          <Link
            href="/mea-sententia"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Conteúdo
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <FormatTag format={article.format} />
            {category && (
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: `${category.color ?? "#4361EE"}25`,
                  color: category.color ?? "#4361EE",
                  padding: "0.25rem 0.875rem",
                  borderRadius: "9999px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                }}
              >
                {category.name_pt}
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 5vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "1.5rem",
            }}
          >
            {article.title_pt}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", flexWrap: "wrap" }}>
            {article.published_at && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Calendar size={14} /> {new Date(article.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            )}
            {article.read_time && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Clock size={14} /> {article.read_time} min de leitura
              </span>
            )}
            {author && <span>Por {author.name}</span>}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
        <div
          className="container-xl article-detail-grid"
          style={{
            maxWidth: "1100px",
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "4rem",
            alignItems: "start",
          }}
        >
          {/* Article body */}
          <article>
            <div
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.85,
                color: "var(--site-text-secondary)",
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdownLite(article.content_pt) }}
            />

            <ShareButtons title={article.title_pt} />

            {/* Author */}
            {author && (
              <Link
                href={{ pathname: "/mea-sententia/autor/[slug]", params: { slug: author.slug } }}
                className="hover-card"
                style={{
                  marginTop: "2.5rem",
                  padding: "1.75rem",
                  backgroundColor: "var(--site-surface-alt)",
                  borderRadius: "1rem",
                  display: "flex",
                  gap: "1.25rem",
                  alignItems: "flex-start",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: author.photo_url ? `url(${author.photo_url}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 800, color: "var(--site-text)", fontSize: "1rem", marginBottom: "0.25rem" }}>
                    {author.name}
                  </div>
                  {author.role_pt && (
                    <div style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                      {author.role_pt}
                    </div>
                  )}
                  {author.bio_pt && (
                    <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                      {author.bio_pt}
                    </p>
                  )}
                </div>
              </Link>
            )}

            {/* Comments */}
            <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "2px solid #4361EE" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--site-text)", marginBottom: "0.75rem" }}>
                {comments.length} comentário{comments.length === 1 ? "" : "s"}
              </h2>
              <p style={{ color: "var(--site-muted)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                O autor da mensagem, e não a People &amp; Growth, é o responsável pelo comentário. Leia as{" "}
                <Link href="/comentarios" style={{ color: "#4361EE", fontWeight: 600, textDecoration: "underline" }}>
                  Regras de Uso dos Comentários
                </Link>
                .
              </p>

              {comments.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        backgroundColor: "var(--site-surface-alt)",
                        borderRadius: "0.875rem",
                        padding: "1.25rem 1.5rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)" }}>{c.name}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--site-faint)" }}>
                          {new Date(c.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p style={{ color: "var(--site-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, whiteSpace: "pre-line" }}>
                        {c.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <CommentForm articleId={article.id} />
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "5rem" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                borderRadius: "1rem",
                padding: "1.75rem",
                color: "white",
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem" }}>
                ✍️ Gostou do artigo?
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                Assine a Mea Sententia e receba perspectivas como essa toda semana.
              </p>
              <NewsletterForm compact />
            </div>

            <div
              style={{
                backgroundColor: "var(--site-surface-alt)",
                borderRadius: "1rem",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)", marginBottom: "1rem" }}>
                Precisa de consultoria?
              </h3>
              <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Ajudamos empresas a crescerem com Marketing, Growth e IA.
              </p>
              <Link
                href="/contato"
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: "#4361EE",
                  color: "white",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.625rem",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Agendar conversa
              </Link>
            </div>
          </aside>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .article-detail-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  );
}
