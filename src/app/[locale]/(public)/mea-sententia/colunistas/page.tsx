import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Author } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Colunistas — Mea Sententia",
  description: "Conheça quem escreve na Mea Sententia: os colunistas da People & Growth.",
};

export default async function ColunistasPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("authors").select("*").eq("status", "active").order("order");
  const authors = (data ?? []) as Author[];

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)", paddingTop: "6rem", paddingBottom: "4rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <Link
            href="/mea-sententia"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem", fontWeight: 500 }}
          >
            <ArrowLeft size={16} /> Conteúdo
          </Link>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, marginBottom: "1rem" }}>Colunistas</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
            Quem escreve a Mea Sententia — perspectivas sobre negócios, pessoas e os temas que impactam o mundo.
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "900px" }}>
          {authors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              Nenhum colunista cadastrado no momento.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {authors.map((author) => (
                <Link
                  key={author.id}
                  href={{ pathname: "/mea-sententia/autor/[slug]", params: { slug: author.slug } }}
                  className="hover-card"
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <article
                    style={{
                      backgroundColor: "var(--site-card)",
                      borderRadius: "1.25rem",
                      padding: "1.75rem",
                      border: "1px solid var(--site-border)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
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
                        <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--site-text)" }}>{author.name}</h2>
                        {author.role_pt && (
                          <p style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.8125rem" }}>{author.role_pt}</p>
                        )}
                      </div>
                    </div>
                    {(author.tagline_pt || author.bio_pt) && (
                      <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.6, flex: 1, marginBottom: "1rem" }}>
                        {author.tagline_pt?.trim() || author.bio_pt}
                      </p>
                    )}
                    <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#4361EE", fontWeight: 700, fontSize: "0.875rem" }}>
                      Ver artigos <ArrowRight size={15} />
                    </span>
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
