import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Search, ChevronRight } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { FormatTag } from "@/components/FormatTag";
import { createClient } from "@/lib/supabase/server";
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

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const [featured, ...rest] = articles;
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
                  href={
                    latest
                      ? { pathname: "/mea-sententia/[slug]", params: { slug: latest.slug } }
                      : { pathname: "/mea-sententia/autor/[slug]", params: { slug: author.slug } }
                  }
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "3rem", alignItems: "start" }} className="mea-sententia-grid">
              {/* Articles */}
              <div>
                {/* Featured */}
                {featured && (
                  <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--site-muted)", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Destaque
                    </h2>
                    <Link
                      href={{ pathname: "/mea-sententia/[slug]", params: { slug: featured.slug } }}
                      style={{ display: "block", textDecoration: "none" }}
                      className="hover-card"
                    >
                      <article
                        style={{
                          backgroundColor: "var(--site-card)",
                          borderRadius: "1.25rem",
                          overflow: "hidden",
                          border: "1px solid var(--site-border)",
                          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                        }}
                      >
                        <div
                          style={{
                            height: "280px",
                            background: featured.cover_image
                              ? `url(${featured.cover_image}) center/cover`
                              : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                          }}
                        >
                          {(() => {
                            const cat = featured.category_id ? categoryById.get(featured.category_id) : null;
                            return cat ? (
                              <span
                                style={{
                                  backgroundColor: `${cat.color ?? "#4361EE"}25`,
                                  color: cat.color ?? "#4361EE",
                                  padding: "0.4rem 1rem",
                                  borderRadius: "9999px",
                                  fontSize: "0.875rem",
                                  fontWeight: 700,
                                }}
                              >
                                {cat.name_pt}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <div style={{ padding: "2rem" }}>
                          <div style={{ marginBottom: "0.75rem" }}>
                            <FormatTag format={featured.format} />
                          </div>
                          <h3 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--site-text)", lineHeight: 1.3, marginBottom: "0.875rem" }}>
                            {featured.title_pt}
                          </h3>
                          {featured.excerpt_pt && (
                            <p style={{ color: "var(--site-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                              {featured.excerpt_pt}
                            </p>
                          )}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.875rem", color: "var(--site-faint)" }}>
                              {featured.published_at && new Date(featured.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                              {featured.read_time ? ` · ${featured.read_time} min de leitura` : ""}
                            </span>
                            <span style={{ color: "#4361EE", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                              Ler artigo <ChevronRight size={16} />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </div>
                )}

                {/* Rest */}
                {rest.length > 0 && (
                  <>
                    <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--site-muted)", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Todos os artigos
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      {rest.map((article) => {
                        const cat = article.category_id ? categoryById.get(article.category_id) : null;
                        return (
                          <Link
                            key={article.id}
                            href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                            style={{ display: "block", textDecoration: "none" }}
                            className="hover-card"
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
                                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.375rem" }}>
                                  {article.title_pt}
                                </h3>
                                {article.excerpt_pt && (
                                  <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", lineHeight: 1.6, marginBottom: "0.625rem" }}>
                                    {article.excerpt_pt}
                                  </p>
                                )}
                                <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)" }}>
                                  {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                  {article.read_time ? ` · ${article.read_time} min` : ""}
                                </span>
                              </div>
                            </article>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Search */}
                <div
                  style={{
                    backgroundColor: "var(--site-card)",
                    borderRadius: "1rem",
                    padding: "1.25rem",
                    border: "1px solid var(--site-border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      backgroundColor: "var(--site-surface-alt)",
                      borderRadius: "0.625rem",
                      padding: "0.625rem 1rem",
                    }}
                  >
                    <Search size={16} color="var(--site-faint)" />
                    <input
                      type="text"
                      placeholder={t("search")}
                      style={{
                        border: "none",
                        background: "none",
                        outline: "none",
                        fontSize: "0.875rem",
                        color: "var(--site-text)",
                        width: "100%",
                      }}
                    />
                  </div>
                </div>

                {/* Most read */}
                {mostRead.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "var(--site-card)",
                      borderRadius: "1rem",
                      padding: "1.5rem",
                      border: "1px solid var(--site-border)",
                    }}
                  >
                    <h3 style={{ fontWeight: 700, color: "var(--site-text)", marginBottom: "1rem", fontSize: "0.9375rem" }}>
                      Mais lidos
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                      {mostRead.map((article, i) => (
                        <Link
                          key={article.id}
                          href={{ pathname: "/mea-sententia/[slug]", params: { slug: article.slug } }}
                          style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", textDecoration: "none" }}
                        >
                          <span style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--site-faint)", lineHeight: 1.3 }}>{i + 1}</span>
                          <span style={{ fontSize: "0.875rem", color: "var(--site-text)", fontWeight: 600, lineHeight: 1.4 }}>{article.title_pt}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "var(--site-card)",
                      borderRadius: "1rem",
                      padding: "1.5rem",
                      border: "1px solid var(--site-border)",
                    }}
                  >
                    <h3 style={{ fontWeight: 700, color: "var(--site-text)", marginBottom: "1rem", fontSize: "0.9375rem" }}>
                      {t("tags")}
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {tags.map((tag) => (
                        <span
                          key={tag.id}
                          style={{
                            backgroundColor: "var(--site-surface-alt)",
                            color: "var(--site-text-secondary)",
                            padding: "0.3rem 0.75rem",
                            borderRadius: "9999px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                          }}
                        >
                          {tag.name_pt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscribe CTA */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    color: "white",
                  }}
                >
                  <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem" }}>
                    ✍️ Assine a Mea Sententia
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                    Opinião sobre negócios, sociedade e os temas que impactam pessoas — direto no seu e-mail.
                  </p>
                  <NewsletterForm compact />
                </div>
              </aside>
            </div>
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
