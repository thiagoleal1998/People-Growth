import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { extractH2Headings, renderMarkdownLite } from "@/lib/markdown-lite";
import { pickLocale } from "@/lib/locale-content";
import { INSTITUTIONAL_DEFAULTS } from "@/lib/institutional-defaults";

export const revalidate = 300;

const DEFAULT_TITLE_PT = INSTITUTIONAL_DEFAULTS["o-que-e-people-and-growth"].titlePt;
const DEFAULT_TITLE_EN = INSTITUTIONAL_DEFAULTS["o-que-e-people-and-growth"].titleEn;
const DEFAULT_BODY_PT = INSTITUTIONAL_DEFAULTS["o-que-e-people-and-growth"].bodyPt;
const DEFAULT_BODY_EN = INSTITUTIONAL_DEFAULTS["o-que-e-people-and-growth"].bodyEn;



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? DEFAULT_TITLE_EN : DEFAULT_TITLE_PT,
    description: locale === "en" ? "The four levels of development behind People & Growth: Person, Leadership, Team and Business." : "Os quatro níveis de desenvolvimento por trás da People & Growth: Pessoa, Liderança, Equipe e Negócio.",
  };
}

export default async function OQueEPeopleAndGrowthPage() {
  const locale = await getLocale();
  const tNav = await getTranslations("nav");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "o-que-e-people-and-growth").single();

  const title = pickLocale(locale, data?.title_pt, data?.title_en) || (locale === "en" ? DEFAULT_TITLE_EN : DEFAULT_TITLE_PT);
  const body = pickLocale(locale, data?.body_pt, data?.body_en) || (locale === "en" ? DEFAULT_BODY_EN : DEFAULT_BODY_PT);
  const headings = extractH2Headings(body);

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
            <ArrowLeft size={16} /> {tNav("about")}
          </Link>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800 }}>{title}</h1>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
        <div className="container-xl" style={{ maxWidth: "1040px" }}>
          <div className="oque-layout">
            {headings.length > 1 && (
              <nav className="oque-toc" aria-label={locale === "en" ? "On this page" : "Nesta página"}>
                <div className="oque-toc-title">{locale === "en" ? "On this page" : "Nesta página"}</div>
                <ul>
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <a href={`#${heading.id}`}>{heading.title}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <div
              style={{ color: "var(--site-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.75, minWidth: 0 }}
              dangerouslySetInnerHTML={{ __html: renderMarkdownLite(body, { anchorHeadings: true }) }}
            />
          </div>
        </div>
        <style>{`
          .oque-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 3rem; align-items: start; }
          .oque-toc { position: sticky; top: 7rem; }
          .oque-toc-title { font-size: 0.6875rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--site-muted); margin-bottom: 0.75rem; }
          .oque-toc ul { list-style: none; margin: 0; padding: 0; border-left: 2px solid var(--site-border); }
          .oque-toc li a { display: block; padding: 0.375rem 0 0.375rem 0.875rem; margin-left: -2px; border-left: 2px solid transparent; color: var(--site-text-secondary); font-size: 0.875rem; line-height: 1.4; text-decoration: none; transition: color 0.15s, border-color 0.15s; }
          .oque-toc li a:hover { color: #4361EE; border-left-color: #4361EE; }
          @media (max-width: 860px) {
            .oque-layout { grid-template-columns: 1fr; gap: 1.5rem; }
            .oque-toc { position: static; background: var(--site-surface-alt); border: 1px solid var(--site-border); border-radius: 0.75rem; padding: 1rem 1.125rem; }
            .oque-toc ul { border-left: none; }
            .oque-toc li a { padding: 0.3rem 0; margin-left: 0; border-left: none; }
          }
        `}</style>
      </section>
    </>
  );
}
