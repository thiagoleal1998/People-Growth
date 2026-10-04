import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";
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
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <div
            style={{ color: "var(--site-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.75 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdownLite(body) }}
          />
        </div>
      </section>
    </>
  );
}
