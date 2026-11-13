import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Linkedin, Instagram, Mail, Globe, ChevronRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { FormatTag } from "@/components/FormatTag";
import { PeopleGrowthBadge } from "@/components/PeopleGrowthBadge";
import { PontoDeReplicaBadge } from "@/components/PontoDeReplicaBadge";
import { ZoomableAvatar } from "@/components/ZoomableAvatar";
import { createClient } from "@/lib/supabase/server";
import { articleHref } from "@/lib/article-url";
import { pickLocale } from "@/lib/locale-content";
import { aboutColumnistLabel, isColumnistPubliclyVisible } from "@/lib/founder-data";
import { ogImageUrl } from "@/lib/og-image";
import type { Article, Columnist, Category } from "@/types/database.types";

export const revalidate = 300;

async function getColumnistData(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: columnist } = await client.from("columnists").select("*").eq("slug", slug).eq("status", "active").single();
  if (!columnist || !isColumnistPubliclyVisible(columnist)) return null;

  const [{ data: articlesData }, { data: categoriesData }] = await Promise.all([
    client.from("articles").select("*").eq("columnist_id", columnist.id).eq("status", "published").order("published_at", { ascending: false }),
    client.from("categories").select("*"),
  ]);

  return {
    columnist: columnist as Columnist,
    articles: (articlesData ?? []) as Article[],
    categories: (categoriesData ?? []) as Category[],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const result = await getColumnistData(slug);
  if (!result) return { title: "Colunista não encontrado" };

  const { columnist } = result;
  const title = `${columnist.name} — ${locale === "en" ? "Content" : "Conteúdo"}`;
  const ogTitle = `${columnist.name} | Grupo Festina`;
  const description = pickLocale(locale, columnist.role_pt, columnist.role_en) ?? pickLocale(locale, columnist.tagline_pt, columnist.tagline_en) ?? undefined;

  // Falls back to the site-wide default OG image (same one articles use)
  // when this columnist has no photo yet — a link preview with no image at
  // all reads as broken, same reasoning as the article page's fallback.
  // "contain" (not the article page's "cover") for the columnist's own
  // photo specifically — a portrait headshot center-cropped into a wide
  // 1200x630 frame loses the top of the head/eyes (confirmed visually,
  // only the mouth-down was left on screen); the site-wide fallback banner
  // is already shaped for "cover" so that one keeps the article pages' default.
  let coverSrc: string | null = columnist.photo_url;
  let fit: "cover" | "contain" = "cover";
  if (coverSrc) {
    fit = "contain";
  } else {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from("site_config").select("value").eq("key", "seo_og_image").maybeSingle();
    coverSrc = (data?.value as string | undefined) || null;
  }
  const ogImage = ogImageUrl(coverSrc, fit === "contain" ? { fit: "contain", bg: "0d1b2a" } : undefined);
  const images = ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined;

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      title: ogTitle,
      description,
      images,
      siteName: "Grupo Festina",
      locale: locale === "pt" ? "pt_BR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ColumnistPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug, locale } = await params;
  const { from } = await searchParams;
  const result = await getColumnistData(slug);

  if (!result) notFound();

  const { columnist, articles, categories } = result;
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const tNav = await getTranslations({ locale, namespace: "nav" });
  // Reached both from general content links (byline on an article, the home
  // carousel) and from the columnist cards on /conteudo/colunistas (tagged
  // with ?from=) — the back link should return wherever the visitor
  // actually came from instead of always assuming /conteudo.
  const backHref = from === "colunistas" ? "/conteudo/colunistas" : "/conteudo";
  const backLabel = from === "colunistas" ? (locale === "en" ? "Columnists" : "Colunistas") : tNav("newsletter");

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
            href={backHref}
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
            <ArrowLeft size={16} /> {backLabel}
          </Link>

          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <ZoomableAvatar photoUrl={columnist.photo_url} name={columnist.name} />
            <div style={{ flex: 1, minWidth: "240px" }}>
              <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "0.375rem" }}>
                {columnist.name}
              </h1>
              {columnist.role_pt && (
                <p style={{ color: "#C89A4A", fontWeight: 600, fontSize: "1rem", marginBottom: "0.875rem" }}>
                  {pickLocale(locale, columnist.role_pt, columnist.role_en)}
                </p>
              )}
              {columnist.bio_pt && (
                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "1rem", maxWidth: "560px" }}>
                  {pickLocale(locale, columnist.bio_pt, columnist.bio_en)}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                <Link
                  href={{ pathname: "/sobre/[slug]", params: { slug: columnist.slug } }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#C89A4A", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}
                >
                  {aboutColumnistLabel(columnist.gender, locale)} <ChevronRight size={14} />
                </Link>
                <div style={{ display: "flex", gap: "0.875rem" }}>
                  {columnist.linkedin_url && (
                    <a href={columnist.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <Linkedin size={19} />
                    </a>
                  )}
                  {columnist.instagram_url && (
                    <a href={columnist.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <Instagram size={19} />
                    </a>
                  )}
                  {columnist.whatsapp_url && (
                    <a href={columnist.whatsapp_url} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <WhatsAppIcon size={19} />
                    </a>
                  )}
                  {columnist.website_url && (
                    <a href={columnist.website_url} target="_blank" rel="noopener noreferrer" aria-label="Site" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <Globe size={19} />
                    </a>
                  )}
                  {columnist.email && (
                    <a href={`mailto:${columnist.email}`} aria-label="E-mail" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <Mail size={19} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "1100px" }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              {locale === "en" ? `${columnist.name} hasn't published any articles yet.` : `${columnist.name} ainda não publicou nenhum artigo.`}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "1.5rem" }}>
              {articles.map((article) => {
                const cat = article.category_id ? categoryById.get(article.category_id) : null;
                return (
                  <Link
                    key={article.id}
                    href={articleHref(article, cat?.slug)}
                    style={{ display: "block", textDecoration: "none" }}
                    className="hover-card"
                  >
                    <article
                      style={{
                        backgroundColor: "var(--site-card)",
                        borderRadius: "1rem",
                        overflow: "hidden",
                        border: "1px solid var(--site-border)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          height: "170px",
                          flexShrink: 0,
                          background: article.cover_image
                            ? `url("${article.cover_image}") center/cover`
                            : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {cat && !article.cover_image && (
                          <span
                            style={{
                              backgroundColor: `${cat.color ?? "#315E9C"}25`,
                              color: cat.color ?? "#315E9C",
                              padding: "0.25rem 0.625rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                            }}
                          >
                            {pickLocale(locale, cat.name_pt, cat.name_en).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ marginBottom: "0.5rem" }}>
                          <FormatTag format={article.format} locale={locale} />
                          {cat?.is_people_growth && <PeopleGrowthBadge />}
                          {cat?.is_ponto_de_replica && <PontoDeReplicaBadge />}
                        </div>
                        <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.375rem" }}>
                          {pickLocale(locale, article.title_pt, article.title_en)}
                        </h3>
                        {article.excerpt_pt && (
                          <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", lineHeight: 1.6, marginBottom: "0.625rem" }}>
                            {pickLocale(locale, article.excerpt_pt, article.excerpt_en)}
                          </p>
                        )}
                        <span style={{ marginTop: "auto", fontSize: "0.8125rem", color: "var(--site-faint)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          {article.published_at && new Date(article.published_at).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
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
