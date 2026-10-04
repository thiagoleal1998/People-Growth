import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { pickLocale } from "@/lib/locale-content";
import { INSTITUTIONAL_DEFAULTS } from "@/lib/institutional-defaults";
import { HideSideRails } from "@/components/HideSideRails";

export const revalidate = 300;

const DEFAULT_TITLE_PT = INSTITUTIONAL_DEFAULTS["termos-de-uso"].titlePt;
const DEFAULT_TITLE_EN = INSTITUTIONAL_DEFAULTS["termos-de-uso"].titleEn;
const DEFAULT_BODY_PT = INSTITUTIONAL_DEFAULTS["termos-de-uso"].bodyPt;
const DEFAULT_BODY_EN = INSTITUTIONAL_DEFAULTS["termos-de-uso"].bodyEn;




export const metadata: Metadata = {
  title: DEFAULT_TITLE_PT,
  description: "Regras de uso do site People & Growth, incluindo conteúdo, comentários e propriedade intelectual.",
};

export default async function TermosDeUsoPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "termos-de-uso").single();

  const title = pickLocale(locale, data?.title_pt, data?.title_en) || (locale === "en" ? DEFAULT_TITLE_EN : DEFAULT_TITLE_PT);
  const body = pickLocale(locale, data?.body_pt, data?.body_en) || (locale === "en" ? DEFAULT_BODY_EN : DEFAULT_BODY_PT);

  return (
    <>
      <HideSideRails />
      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
      <div className="container-xl" style={{ maxWidth: "720px" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
          {title}
        </h1>
        <p style={{ color: "var(--site-muted)", fontSize: "1rem", marginBottom: "2.5rem" }}>
          {locale === "en" ? "Last updated" : "Última atualização"}: {new Date().toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", { month: "long", year: "numeric" })}
        </p>

        <div
          style={{ color: "var(--site-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.75 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownLite(body) }}
        />
      </div>
      </section>
    </>
  );
}
