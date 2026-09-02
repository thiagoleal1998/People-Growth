import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Award, Linkedin, Instagram, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Author } from "@/types/database.types";
import { parseMilestones, bioParagraphs } from "../founderData";

export const revalidate = 300;

async function getFounder(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: author } = await client.from("authors").select("*").eq("slug", slug).eq("status", "active").single();
  if (!author) return null;

  const { count } = await client
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("author_id", author.id)
    .eq("status", "published");

  return { author: author as Author, articleCount: count ?? 0 };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getFounder(slug);
  if (!result) return { title: "Não encontrado" };
  return {
    title: result.author.name,
    description: result.author.tagline_pt ?? result.author.role_pt ?? undefined,
  };
}

export default async function FounderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getFounder(slug);
  if (!result) notFound();

  const { author, articleCount } = result;
  const milestones = parseMilestones(author.milestones_pt);
  const paragraphs = bioParagraphs(author.bio_pt);

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
            href="/sobre"
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
            <ArrowLeft size={16} /> Sobre
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
              {author.tagline_pt && (
                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "1rem", maxWidth: "560px", fontStyle: "italic" }}>
                  &ldquo;{author.tagline_pt}&rdquo;
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

      <section className="section-padding" style={{ backgroundColor: "white" }}>
        <div
          className="container-xl"
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
                <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1rem" }}>
                  Sobre {author.name.split(" ")[0]}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {paragraphs.map((p, i) => (
                    <p key={i} style={{ color: "#475569", fontSize: "1rem", lineHeight: 1.75 }}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {articleCount > 0 && (
              <Link
                href={{ pathname: "/mea-sententia/autor/[slug]", params: { slug: author.slug } }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "#f0f4f8",
                  color: "#0d1b2a",
                  padding: "0.875rem 1.5rem",
                  borderRadius: "0.75rem",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                }}
              >
                Ver artigos de {author.name.split(" ")[0]} <ArrowRight size={18} />
              </Link>
            )}
          </div>

          {milestones.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.25rem" }}>
                Trajetória
              </h2>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "1.125rem",
                    top: "0.25rem",
                    bottom: "0.25rem",
                    width: "2px",
                    backgroundColor: "#e2e8f0",
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
                          backgroundColor: "#4361EE",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          zIndex: 1,
                          border: "3px solid white",
                        }}
                      >
                        <Award size={12} color="white" />
                      </div>
                      <div>
                        <div
                          style={{
                            display: "inline-block",
                            backgroundColor: "rgba(67,97,238,0.1)",
                            color: "#4361EE",
                            padding: "0.125rem 0.625rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            marginBottom: "0.25rem",
                          }}
                        >
                          {m.year}
                        </div>
                        <div style={{ color: "#334155", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4 }}>{m.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
