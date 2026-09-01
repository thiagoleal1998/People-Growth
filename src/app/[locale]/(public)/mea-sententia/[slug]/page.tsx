import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import type { Article, Category } from "@/types/database.types";

export const revalidate = 300;

async function getArticle(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: article } = await client.from("articles").select("*").eq("slug", slug).eq("status", "published").single();
  if (!article) return null;

  const category = article.category_id
    ? (await client.from("categories").select("*").eq("id", article.category_id).single()).data
    : null;

  const config = (await client.from("site_config").select("*")).data as { key: string; value: string | null }[] | null;

  return { article: article as Article, category: category as Category | null, config: Object.fromEntries((config ?? []).map((c) => [c.key, c.value ?? ""])) };
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

  const { article, category, config } = result;

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
            <ArrowLeft size={16} /> Mea Sententia
          </Link>

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
                marginBottom: "1.25rem",
              }}
            >
              {category.name_pt}
            </span>
          )}

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
            <span>Por Thiago Leal</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding" style={{ backgroundColor: "white" }}>
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
                color: "#374151",
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdownLite(article.content_pt) }}
            />

            {/* Author */}
            <div
              style={{
                marginTop: "2.5rem",
                padding: "1.75rem",
                backgroundColor: "#f0f4f8",
                borderRadius: "1rem",
                display: "flex",
                gap: "1.25rem",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "4rem",
                  height: "4rem",
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: config.hero_photo ? `url(${config.hero_photo}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
                }}
              />
              <div>
                <div style={{ fontWeight: 800, color: "#0d1b2a", fontSize: "1rem", marginBottom: "0.25rem" }}>
                  Thiago Leal
                </div>
                <div style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  Fundador da People & Growth · Especialista em Marketing, Growth e IA
                </div>
                <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  Consultor estratégico com mais de 7 anos de experiência em Marketing Digital, Growth e Inteligência Artificial.
                </p>
              </div>
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
                backgroundColor: "#f0f4f8",
                borderRadius: "1rem",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0d1b2a", marginBottom: "1rem" }}>
                Precisa de consultoria?
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Ajudo empresas a crescerem com Marketing, Growth e IA.
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
