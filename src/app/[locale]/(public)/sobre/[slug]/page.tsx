import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Award, Linkedin, Instagram, Mail, Globe } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { createClient } from "@/lib/supabase/server";
import { pickLocale } from "@/lib/locale-content";
import type { Columnist } from "@/types/database.types";
import { parseMilestones, bioParagraphs, isColumnistPubliclyVisible } from "@/lib/founder-data";
import { ogImageUrl } from "@/lib/og-image";

export const revalidate = 300;

async function getFounder(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: columnist } = await client.from("columnists").select("*").eq("slug", slug).eq("status", "active").single();
  if (!columnist || !isColumnistPubliclyVisible(columnist)) return null;

  const { count } = await client
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("columnist_id", columnist.id)
    .eq("status", "published");

  return { columnist: columnist as Columnist, articleCount: count ?? 0 };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const result = await getFounder(slug);
  if (!result) return { title: "Não encontrado" };

  const { columnist } = result;
  const description = pickLocale(locale, columnist.tagline_pt, columnist.tagline_en) ?? pickLocale(locale, columnist.role_pt, columnist.role_en) ?? undefined;
  const ogTitle = `${columnist.name} | Grupo Festina`;

  // Same fallback-to-site-default reasoning as the /conteudo/colunista
  // profile and the article pages — no image at all reads as broken in a
  // WhatsApp/Telegram link preview. "contain" for the columnist's own photo
  // specifically — see the matching comment in /conteudo/colunista/[slug]
  // for why a center-cropped headshot loses the top of the head/eyes.
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
    title: columnist.name,
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

export default async function FounderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug, locale } = await params;
  const { from } = await searchParams;
  const result = await getFounder(slug);
  if (!result) notFound();

  const { columnist, articleCount } = result;
  const milestones = parseMilestones(pickLocale(locale, columnist.milestones_pt, columnist.milestones_en));
  const paragraphs = bioParagraphs(pickLocale(locale, columnist.bio_pt, columnist.bio_en));
  // Reached from the founders grid on /sobre, the columnist cards on
  // /conteudo/colunistas (tagged with ?from=colunistas), or a direct
  // link/search result with no ?from= at all — in every one of those except
  // the colunistas case, the back link goes to this person's own articles
  // rather than the institutional /sobre page, founder or not.
  const cameFromColunistas = from === "colunistas";
  const backHref = cameFromColunistas
    ? "/conteudo/colunistas"
    : { pathname: "/conteudo/colunista/[slug]" as const, params: { slug: columnist.slug } };
  const backLabel = cameFromColunistas
    ? (locale === "en" ? "Columnists" : "Colunistas")
    : (locale === "en" ? "Columnist's content" : "Conteúdos do colunista");

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
            <div
              style={{
                width: "6rem",
                height: "6rem",
                borderRadius: "50%",
                flexShrink: 0,
                background: columnist.photo_url ? `url("${columnist.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
              }}
            />
            <div style={{ flex: 1, minWidth: "240px" }}>
              <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "0.375rem" }}>
                {columnist.name}
              </h1>
              {columnist.role_pt && (
                <p style={{ color: "#C89A4A", fontWeight: 600, fontSize: "1rem", marginBottom: "0.875rem" }}>
                  {pickLocale(locale, columnist.role_pt, columnist.role_en)}
                </p>
              )}
              {columnist.tagline_pt && (
                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "1rem", maxWidth: "560px", fontStyle: "italic" }}>
                  &ldquo;{pickLocale(locale, columnist.tagline_pt, columnist.tagline_en)}&rdquo;
                </p>
              )}
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
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
        <div
          className="container-xl sobre-bio-grid"
          style={{
            maxWidth: "920px",
            display: "grid",
            gridTemplateColumns: milestones.length > 0 ? "2fr 1fr" : "1fr",
            gap: "3rem",
            alignItems: "start",
          }}
        >
          <div>
            {paragraphs.length > 0 && (
              <div style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "1rem" }}>
                  {locale === "en" ? `About ${columnist.name.split(" ")[0]}` : `Sobre ${columnist.name.split(" ")[0]}`}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {paragraphs.map((p, i) => (
                    <p key={i} style={{ color: "var(--site-text-secondary)", fontSize: "1rem", lineHeight: 1.75 }}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {articleCount > 0 && (
              <Link
                href={{ pathname: "/conteudo/colunista/[slug]", params: { slug: columnist.slug } }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "var(--site-surface-alt)",
                  color: "var(--site-text)",
                  padding: "0.875rem 1.5rem",
                  borderRadius: "0.75rem",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                }}
              >
                {locale === "en" ? `View ${columnist.name.split(" ")[0]}'s articles` : `Ver artigos de ${columnist.name.split(" ")[0]}`} <ArrowRight size={18} />
              </Link>
            )}
          </div>

          {milestones.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "1.25rem" }}>
                {locale === "en" ? "Journey" : "Trajetória"}
              </h2>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "1.125rem",
                    top: "0.25rem",
                    bottom: "0.25rem",
                    width: "2px",
                    backgroundColor: "var(--site-border-strong)",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {milestones.map((m, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", position: "relative" }}>
                      <div
                        style={{
                          width: "2.25rem",
                          height: "2.25rem",
                          borderRadius: "50%",
                          backgroundColor: "#315E9C",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          zIndex: 1,
                          border: "3px solid var(--site-bg)",
                        }}
                      >
                        <Award size={12} color="white" />
                      </div>
                      <div>
                        <div
                          style={{
                            display: "inline-block",
                            backgroundColor: "rgba(49, 94, 156,0.1)",
                            color: "#315E9C",
                            padding: "0.125rem 0.625rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            marginBottom: "0.25rem",
                          }}
                        >
                          {m.year}
                        </div>
                        <div style={{ color: "var(--site-text-secondary)", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4 }}>{m.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @media (max-width: 900px) {
            .sobre-bio-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  );
}
