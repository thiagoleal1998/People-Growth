import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Clock, Calendar, ChevronRight, Linkedin, Instagram } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { FormatTag } from "@/components/FormatTag";
import { ShareButtons } from "@/components/ShareButtons";
import { Comments } from "@/components/Comments";
import { AdBanner } from "@/components/AdBanner";
import { MostRead } from "@/components/MostRead";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ArticleBody } from "@/components/ArticleBody";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite, stripMarkdownLite } from "@/lib/markdown-lite";
import { toYouTubeEmbedUrl } from "@/lib/youtube";
import { articleHref, articlePath, FORMAT_SEGMENT, UNCATEGORIZED_SEGMENT } from "@/lib/article-url";
import { pickLocale } from "@/lib/locale-content";
import type { Article, Category, Author, Comment } from "@/types/database.types";

export const revalidate = 300;

// No loading.tsx for this route (or its [segment] ancestor) — this page
// calls permanentRedirect() when the URL's format/category segments are
// stale, and a loading.tsx anywhere in the ancestor chain silently
// swallows that redirect in this Next.js version, serving a 200 with no
// redirect instead. Confirmed by isolated reproduction.
type ArticleWithCategory = Article & { categories: Pick<Category, "slug"> | null };

async function getArticle(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: article } = await client
    .from("articles")
    .select("*, categories(slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (!article) return null;

  const [categoryRes, authorRes, commentsRes, allAuthorsRes] = await Promise.all([
    article.category_id ? client.from("categories").select("*").eq("id", article.category_id).single() : Promise.resolve({ data: null }),
    article.author_id ? client.from("authors").select("*").eq("id", article.author_id).single() : Promise.resolve({ data: null }),
    client.from("comments").select("*").eq("article_id", article.id).eq("status", "approved").order("created_at", { ascending: false }),
    client.from("authors").select("*"),
  ]);
  // Used to show "Por {autor}" on each "Leia também" card below — a
  // separate fetch of every author rather than a join, matching the same
  // pattern already used on the homepage/category/search listings.
  const authorById = new Map(((allAuthorsRes.data ?? []) as Author[]).map((a) => [a.id, a]));

  let related: ArticleWithCategory[] = [];
  if (article.category_id) {
    const { data } = await client
      .from("articles")
      .select("*, categories(slug)")
      .eq("status", "published")
      .eq("category_id", article.category_id)
      .neq("id", article.id)
      .order("published_at", { ascending: false })
      .limit(3);
    related = (data ?? []) as ArticleWithCategory[];
  }
  if (related.length < 3) {
    const { data } = await client
      .from("articles")
      .select("*, categories(slug)")
      .eq("status", "published")
      .neq("id", article.id)
      .order("published_at", { ascending: false })
      .limit(3 + related.length);
    const fill = ((data ?? []) as ArticleWithCategory[]).filter((a) => !related.some((r) => r.id === a.id));
    related = [...related, ...fill].slice(0, 3);
  }

  return {
    article: article as ArticleWithCategory,
    category: categoryRes.data as Category | null,
    author: authorRes.data as Author | null,
    comments: (commentsRes.data ?? []) as Comment[],
    related,
    authorById,
  };
}

// The dynamic segment is named "segment" (not "format") because the sibling
// legacy-redirect route at /conteudo/[segment]/page.tsx uses a single [slug]
// param there — Next.js requires sibling dynamic routes at the same
// directory level to share one param name.
type RouteParams = { slug: string; segment: string; category: string; locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const result = await getArticle(slug);
  if (!result) return { title: "Artigo não encontrado" };

  const title = pickLocale(locale, result.article.seo_title_pt, result.article.seo_title_en) || pickLocale(locale, result.article.title_pt, result.article.title_en);
  const description = pickLocale(locale, result.article.seo_desc_pt, result.article.seo_desc_en) || pickLocale(locale, result.article.excerpt_pt, result.article.excerpt_en) || undefined;
  const images = result.article.cover_image ? [{ url: result.article.cover_image, width: 1200, height: 630 }] : undefined;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      images,
      publishedTime: result.article.published_at ?? undefined,
      authors: result.author ? [result.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: result.article.cover_image ? [result.article.cover_image] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug, segment: format, category, locale } = await params;
  const result = await getArticle(slug);

  if (!result) notFound();

  const tc = await getTranslations({ locale, namespace: "common" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const { article, category: categoryRow, author, comments, related, authorById } = result;

  // Self-healing canonical URL: if the format/category in the address bar
  // doesn't match this article's actual data (stale link, category changed
  // since, wrong format guessed), permanently redirect to the correct one
  // instead of serving the same content at two different URLs.
  const canonicalFormat = FORMAT_SEGMENT[article.format];
  const canonicalCategory = article.categories?.slug || UNCATEGORIZED_SEGMENT;
  if (format !== canonicalFormat || category !== canonicalCategory) {
    permanentRedirect(articlePath(article, article.categories?.slug, locale === "en" ? "en" : "pt"));
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://peopleandgrowth.com.br";
  const canonicalPath = articlePath(article, article.categories?.slug, "pt");
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: pickLocale(locale, article.title_pt, article.title_en),
    description: pickLocale(locale, article.excerpt_pt, article.excerpt_en) ?? undefined,
    image: article.cover_image ? [article.cover_image] : undefined,
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at ?? article.published_at ?? article.created_at,
    author: author ? { "@type": "Person", name: author.name, url: `${siteUrl}/conteudo/autor/${author.slug}` } : undefined,
    publisher: {
      "@type": "Organization",
      name: "People & Growth",
      logo: { "@type": "ImageObject", url: `${siteUrl}/favicon.ico` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}${canonicalPath}` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ReadingProgress />

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
            href="/conteudo"
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
            <ArrowLeft size={16} /> {tNav("newsletter")}
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <FormatTag format={article.format} locale={locale} />
            {categoryRow && (
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: `${categoryRow.color ?? "#4361EE"}25`,
                  color: categoryRow.color ?? "#4361EE",
                  padding: "0.25rem 0.875rem",
                  borderRadius: "9999px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                }}
              >
                {pickLocale(locale, categoryRow.name_pt, categoryRow.name_en)}
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
            {pickLocale(locale, article.title_pt, article.title_en)}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", flexWrap: "wrap" }}>
            {article.published_at && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Calendar size={14} /> {new Date(article.published_at).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            )}
            {article.read_time && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Clock size={14} /> {article.read_time} {tc("minutes")}
              </span>
            )}
            {author && <span>{tc("by")} {author.name}</span>}
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
            {author && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  padding: "1rem 0",
                  marginBottom: "1.75rem",
                  borderTop: "1px solid var(--site-border)",
                  borderBottom: "1px solid var(--site-border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: author.photo_url ? `url(${author.photo_url}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--site-text)", fontSize: "0.9375rem" }}>{author.name}</div>
                    <Link
                      href={{ pathname: "/conteudo/autor/[slug]", params: { slug: author.slug } }}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.125rem", color: "#4361EE", fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none" }}
                    >
                      {locale === "en"
                        ? "About the author"
                        : `Sobre ${author.gender === "feminino" ? "a autora" : "o autor"}`} <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

                {(author.linkedin_url || author.instagram_url) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ color: "var(--site-muted)", fontSize: "0.8125rem", fontWeight: 600 }}>{locale === "en" ? "Follow on social media" : "Siga nas redes"}</span>
                    <div style={{ display: "flex", gap: "0.625rem" }}>
                      {author.linkedin_url && (
                        <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: "var(--site-text)" }}>
                          <Linkedin size={17} />
                        </a>
                      )}
                      {author.instagram_url && (
                        <a href={author.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: "var(--site-text)" }}>
                          <Instagram size={17} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <ArticleBody
              title={pickLocale(locale, article.title_pt, article.title_en)}
              summary={pickLocale(locale, article.summary_pt, article.summary_en)}
              speechText={stripMarkdownLite(pickLocale(locale, article.content_pt, article.content_en))}
              bodyHtml={renderMarkdownLite(pickLocale(locale, article.content_pt, article.content_en))}
              coverImage={article.cover_image}
              coverImageCaption={article.cover_image_caption}
              coverImageCredit={article.cover_image_credit}
              videoEmbedUrl={article.video_url ? toYouTubeEmbedUrl(article.video_url) : null}
            />

            <ShareButtons title={pickLocale(locale, article.title_pt, article.title_en)} />

            <div style={{ marginTop: "2rem" }}>
              <AdBanner slotKey="article-instream" articleId={article.id} />
            </div>

            {/* Author */}
            {author && (
              <Link
                href={{ pathname: "/conteudo/autor/[slug]", params: { slug: author.slug } }}
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
                      {pickLocale(locale, author.role_pt, author.role_en)}
                    </div>
                  )}
                  {author.bio_pt && (
                    <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                      {pickLocale(locale, author.bio_pt, author.bio_en)}
                    </p>
                  )}
                </div>
              </Link>
            )}

            {/* Related articles */}
            {related.length > 0 && (
              <div style={{ marginTop: "3rem" }}>
                <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--site-text)", marginBottom: "1.25rem" }}>
                  {locale === "en" ? "Read also" : "Leia também"}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "1.25rem" }}>
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={articleHref(r, r.categories?.slug)}
                      className="hover-card"
                      style={{ display: "block", textDecoration: "none" }}
                    >
                      <div
                        style={{
                          height: "110px",
                          borderRadius: "0.5rem",
                          marginBottom: "0.625rem",
                          background: r.cover_image ? `url(${r.cover_image}) center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                        }}
                      />
                      <div style={{ marginBottom: "0.375rem" }}>
                        <FormatTag format={r.format} locale={locale} />
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)", lineHeight: 1.4 }}>
                        {pickLocale(locale, r.title_pt, r.title_en)}
                      </h3>
                      {r.author_id && authorById.get(r.author_id) && (
                        <span style={{ display: "block", marginTop: "0.375rem", fontSize: "0.75rem", color: "var(--site-faint)" }}>
                          {tc("by")} {authorById.get(r.author_id)!.name}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "2px solid #4361EE" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--site-text)", marginBottom: "0.75rem" }}>
                {comments.length} {locale === "en" ? `comment${comments.length === 1 ? "" : "s"}` : `comentário${comments.length === 1 ? "" : "s"}`}
              </h2>
              <p style={{ color: "var(--site-muted)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                {locale === "en" ? (
                  <>
                    The author of the message, not People &amp; Growth, is responsible for the comment. Read the{" "}
                    <Link href="/comentarios" style={{ color: "#4361EE", fontWeight: 600, textDecoration: "underline" }}>
                      Comment Guidelines
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    O autor da mensagem, e não a People &amp; Growth, é o responsável pelo comentário. Leia as{" "}
                    <Link href="/comentarios" style={{ color: "#4361EE", fontWeight: 600, textDecoration: "underline" }}>
                      Regras de Uso dos Comentários
                    </Link>
                    .
                  </>
                )}
              </p>

              <Comments articleId={article.id} comments={comments} />
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
                {locale === "en" ? "✍️ Liked the article?" : "✍️ Gostou do artigo?"}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                {locale === "en"
                  ? "Subscribe to Mea Sententia and get perspectives like this every week."
                  : "Assine a Mea Sententia e receba perspectivas como essa toda semana."}
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
                {locale === "en" ? "Need consulting?" : "Precisa de consultoria?"}
              </h3>
              <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                {locale === "en"
                  ? "We help businesses grow with Marketing, Growth and AI."
                  : "Ajudamos empresas a crescerem com Marketing, Growth e IA."}
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
                {locale === "en" ? "Schedule a call" : "Agendar conversa"}
              </Link>
            </div>

            <MostRead excludeId={article.id} />

            <AdBanner slotKey="article-sidebar" articleId={article.id} />
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
