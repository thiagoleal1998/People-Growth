"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Search, ChevronRight } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { FormatTag } from "@/components/FormatTag";
import type { Article, Category, Tag } from "@/types/database.types";

function matches(article: Article, query: string) {
  const q = query.toLowerCase();
  return (
    article.title_pt.toLowerCase().includes(q) ||
    (article.excerpt_pt ?? "").toLowerCase().includes(q)
  );
}

function ArticleRow({ article, category }: { article: Article; category: Category | undefined }) {
  return (
    <Link
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
          {category && !article.cover_image && (
            <span
              style={{
                backgroundColor: `${category.color ?? "#4361EE"}25`,
                color: category.color ?? "#4361EE",
                padding: "0.2rem 0.5rem",
                borderRadius: "0.25rem",
                fontSize: "0.625rem",
                fontWeight: 700,
              }}
            >
              {category.name_pt.toUpperCase()}
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
}

export function ArticlesExplorer({
  articles,
  categories,
  tags,
  mostRead,
  searchPlaceholder,
  noResultsText,
  tagsLabel,
}: {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  mostRead: Article[];
  searchPlaceholder: string;
  noResultsText: string;
  tagsLabel: string;
}) {
  const [query, setQuery] = useState("");
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const [featured, ...rest] = articles;

  const results = useMemo(() => {
    if (!query.trim()) return null;
    return articles.filter((a) => matches(a, query));
  }, [query, articles]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "3rem", alignItems: "start" }} className="mea-sententia-grid">
      {/* Articles */}
      <div>
        {results ? (
          <>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--site-muted)", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {results.length} resultado{results.length === 1 ? "" : "s"} para &ldquo;{query}&rdquo;
            </h2>
            {results.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>{noResultsText}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {results.map((article) => (
                  <ArticleRow key={article.id} article={article} category={article.category_id ? categoryById.get(article.category_id) : undefined} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
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
                  {rest.map((article) => (
                    <ArticleRow key={article.id} article={article} category={article.category_id ? categoryById.get(article.category_id) : undefined} />
                  ))}
                </div>
              </>
            )}
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
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
              {tagsLabel}
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
  );
}
