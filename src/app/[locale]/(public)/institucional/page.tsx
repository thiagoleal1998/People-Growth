import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { institucionalHref } from "@/lib/institucional-url";
import { pickLocale } from "@/lib/locale-content";
import { joinColumnistNames } from "@/lib/founder-data";
import type { Columnist, InstitutionalPost } from "@/types/database.types";

export const revalidate = 300;

// Institutional is the official voice of the company — cartas ao leitor do
// C-level, comunicados oficiais, posicionamentos — deliberately kept
// separate from the editorial `articles` pipeline (own table, no
// categories, no columnist review flow). See InstitutionalPostView for the
// shared render used here and by the admin preview route.
async function getInstitutionalData() {
  const supabase = await createClient();
  const client = supabase as any;

  const [{ data: postsData }, { data: columnistsData }, { data: authorsData }] = await Promise.all([
    client.from("institutional_posts").select("*").eq("status", "published").order("published_at", { ascending: false }),
    client.from("columnists").select("*"),
    client.from("institutional_post_authors").select("post_id, columnist_id"),
  ]);

  const columnistById = new Map(((columnistsData ?? []) as Columnist[]).map((c) => [c.id, c]));
  const authorIdsByPost = new Map<string, string[]>();
  for (const a of (authorsData ?? []) as { post_id: string; columnist_id: string }[]) {
    authorIdsByPost.set(a.post_id, [...(authorIdsByPost.get(a.post_id) ?? []), a.columnist_id]);
  }

  return {
    posts: (postsData ?? []) as InstitutionalPost[],
    columnistById,
    authorIdsByPost,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Institutional" : "Institucional",
    description:
      locale === "en"
        ? "Official statements, letters to our readers and positions from Grupo Festina's leadership."
        : "Comunicados oficiais, cartas ao leitor e posicionamentos da liderança do Grupo Festina.",
  };
}

export default async function InstitucionalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { posts, columnistById, authorIdsByPost } = await getInstitutionalData();

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #16293e 100%)", paddingTop: "6rem", paddingBottom: "3.5rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: "rgba(200,154,74,0.18)",
              color: "#C89A4A",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            {locale === "en" ? "GRUPO FESTINA" : "GRUPO FESTINA"}
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 1rem" }}>
            {locale === "en" ? "Institutional" : "Institucional"}
          </h1>
          <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
            {locale === "en"
              ? "Official statements, letters to our readers and positions from Grupo Festina's leadership — separate from our editorial coverage."
              : "Comunicados oficiais, cartas ao leitor e posicionamentos da liderança do Grupo Festina — separados da nossa cobertura editorial."}
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface)" }}>
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          {posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              {locale === "en" ? "Nothing published here yet." : "Nada publicado aqui ainda."}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {posts.map((post) => {
                const authorNames = (authorIdsByPost.get(post.id) ?? [])
                  .map((id) => columnistById.get(id)?.name)
                  .filter((n): n is string => Boolean(n));
                const byline = authorNames.length > 0 ? joinColumnistNames(authorNames, locale) : "Grupo Festina";
                return (
                  <Link key={post.id} href={institucionalHref(post)} style={{ display: "block", textDecoration: "none" }} className="hover-card">
                    <article style={{ backgroundColor: "var(--site-card)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--site-border)", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "5rem",
                          height: "5rem",
                          flexShrink: 0,
                          borderRadius: "0.75rem",
                          background: post.cover_image ? `url("${post.cover_image}") center/cover` : "linear-gradient(135deg, #0d1b2a, #16293e)",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: "0.375rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: "0.6875rem",
                              fontWeight: 800,
                              letterSpacing: "0.03em",
                              textTransform: "uppercase",
                              color: "#315E9C",
                              backgroundColor: "rgba(49,94,156,0.12)",
                              padding: "0.1875rem 0.5rem",
                              borderRadius: "0.25rem",
                            }}
                          >
                            {locale === "en" ? "Institutional" : "Institucional"}
                          </span>
                        </div>
                        <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.375rem" }}>
                          {pickLocale(locale, post.title_pt, post.title_en)}
                        </h3>
                        {post.excerpt_pt && (
                          <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", lineHeight: 1.6, marginBottom: "0.625rem" }}>
                            {pickLocale(locale, post.excerpt_pt, post.excerpt_en)}
                          </p>
                        )}
                        <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)" }}>
                          {(locale === "en" ? "By " : "Por ") + byline}
                          {post.published_at && " · " + new Date(post.published_at).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
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
