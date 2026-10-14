import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { pickLocale } from "@/lib/locale-content";
import { isAuthorPubliclyVisible } from "@/lib/founder-data";
import type { Author } from "@/types/database.types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Colunistas — Mea Sententia",
  description: "Conheça quem escreve na Mea Sententia: os colunistas da Festina.",
};

export default async function ColunistasPage() {
  const locale = await getLocale();
  const tNav = await getTranslations("nav");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("authors").select("*").eq("status", "active").order("order");
  const allAuthors = ((data ?? []) as Author[]).filter(isAuthorPubliclyVisible);
  // The DB's own "order" column doesn't distinguish founders from everyone
  // else, so the grid used to just come out in whatever order rows happened
  // to be inserted — founders first, in their own row, then everyone else
  // alphabetically, rather than one undifferentiated list.
  const byName = (a: Author, b: Author) => a.name.localeCompare(b.name, "pt-BR");
  const founders = allAuthors.filter((a) => a.is_founder).sort(byName);
  const columnists = allAuthors.filter((a) => !a.is_founder).sort(byName);
  // The founders row is a 2-up-1-down pyramid (Gustavo and Raul side by
  // side, Thiago centered below them) rather than a plain 3-column grid —
  // alphabetical order happens to put Thiago last, which is exactly the
  // "goes on the bottom row" slot this layout needs. Only correct for
  // exactly 3 founders; falls back to the plain grid otherwise.
  const foundersTopRow = founders.length === 3 ? founders.slice(0, 2) : founders;
  const foundersBottomRow = founders.length === 3 ? founders.slice(2) : [];

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)", paddingTop: "6rem", paddingBottom: "4rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <Link
            href="/conteudo"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem", fontWeight: 500 }}
          >
            <ArrowLeft size={16} /> {tNav("newsletter")}
          </Link>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, marginBottom: "1rem" }}>{locale === "en" ? "Columnists" : "Colunistas"}</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
            {locale === "en"
              ? "Who writes Mea Sententia — perspectives on business, people and the issues shaping the world."
              : "Quem escreve a Mea Sententia — perspectivas sobre negócios, pessoas e os temas que impactam o mundo."}
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ maxWidth: "900px" }}>
          {allAuthors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>
              {locale === "en" ? "No columnists registered at the moment." : "Nenhum colunista cadastrado no momento."}
            </div>
          ) : (
            <>
              {founders.length > 0 && (
                <div style={{ marginBottom: "2.5rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#C89A4A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
                    {locale === "en" ? "Editorial Board" : "Conselho Editorial"}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "1.5rem" }}>
                    {foundersTopRow.map((author) => (
                      <AuthorCard key={author.id} author={author} locale={locale} accent="#C89A4A" />
                    ))}
                  </div>
                  {foundersBottomRow.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
                      {foundersBottomRow.map((author) => (
                        // Matches the top row's own column width exactly (same
                        // minmax(min(280px, 100%), 1fr) math, just via flex-basis
                        // since this is a 1-item row) — same size as Gustavo's
                        // and Raul's cards, just centered on its own line below them.
                        <div key={author.id} style={{ flex: "0 1 calc(50% - 0.75rem)", minWidth: "min(280px, 100%)" }}>
                          <AuthorCard author={author} locale={locale} accent="#C89A4A" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {columnists.length > 0 && (
                <div>
                  {founders.length > 0 && (
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem", paddingTop: "1.5rem", borderTop: "1px solid var(--site-border)" }}>
                      {locale === "en" ? "Columnists" : "Colunistas"}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "1.5rem" }}>
                    {columnists.map((author) => (
                      <AuthorCard key={author.id} author={author} locale={locale} accent="#315E9C" />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

function AuthorCard({ author, locale, accent }: { author: Author; locale: string; accent: string }) {
  return (
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
            background: author.photo_url ? `url("${author.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
          }}
        />
        <div>
          <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--site-text)" }}>{author.name}</h2>
          {author.role_pt && (
            <p style={{ color: accent, fontWeight: 600, fontSize: "0.8125rem" }}>{pickLocale(locale, author.role_pt, author.role_en)}</p>
          )}
        </div>
      </div>
      {(author.tagline_pt || author.bio_pt) && (
        <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", lineHeight: 1.6, flex: 1, marginBottom: "1rem" }}>
          {pickLocale(locale, author.tagline_pt, author.tagline_en)?.trim() || pickLocale(locale, author.bio_pt, author.bio_en)}
        </p>
      )}
      <div style={{ display: "flex", gap: "1.25rem", marginTop: (author.tagline_pt || author.bio_pt) ? 0 : "auto", paddingTop: (author.tagline_pt || author.bio_pt) ? 0 : "1rem" }}>
        <Link
          href={{ pathname: "/sobre/[slug]", params: { slug: author.slug } }}
          style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: accent, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}
        >
          {locale === "en" ? "About" : "Sobre"} <ArrowRight size={15} />
        </Link>
        <Link
          href={{ pathname: "/conteudo/autor/[slug]", params: { slug: author.slug } }}
          style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--site-muted)", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}
        >
          {locale === "en" ? "View articles" : "Ver artigos"} <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
