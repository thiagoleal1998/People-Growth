import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { pickLocale } from "@/lib/locale-content";

export const revalidate = 300;

const DEFAULT_TITLE_PT = "Aviso de Direitos Autorais";
const DEFAULT_TITLE_EN = "Copyright Notice";
const DEFAULT_BODY_PT = `## Titularidade do conteúdo
Os textos, imagens, vídeos e demais materiais publicados pela People & Growth — incluindo artigos, a coluna Mea Sententia e páginas institucionais — são de titularidade da People & Growth ou de seus autores, e protegidos pela legislação brasileira de direitos autorais (Lei nº 9.610/1998), salvo quando indicada outra fonte.

## Uso permitido
É permitido compartilhar links para o nosso conteúdo e citar trechos curtos, desde que citada a fonte com link para o artigo original. Reprodução integral de artigos, sem autorização prévia, não é permitida.

## Materiais de terceiros
Imagens e vídeos incorporados de terceiros (como YouTube) pertencem a seus respectivos autores ou licenciantes e são utilizados conforme os termos de uso das plataformas de origem.

## Solicitações e denúncias
Caso identifique conteúdo nosso publicado indevidamente em outro site, ou acredite que publicamos algo que viola direitos autorais de terceiros, entre em contato pela [página de Contato](/contato).`;
const DEFAULT_BODY_EN = `## Content ownership
The text, images, videos and other materials published by People & Growth — including articles, the Mea Sententia column and institutional pages — are owned by People & Growth or its authors, and protected by Brazilian copyright law (Law No. 9,610/1998), unless another source is indicated.

## Permitted use
You may share links to our content and quote short excerpts, provided the source is cited with a link to the original article. Full reproduction of articles without prior authorization is not permitted.

## Third-party materials
Images and videos embedded from third parties (such as YouTube) belong to their respective authors or licensors and are used according to the terms of use of the originating platforms.

## Requests and reports
If you find our content published without authorization on another site, or believe we've published something that infringes a third party's copyright, please contact us via the [Contact page](/contato).`;

export const metadata: Metadata = {
  title: DEFAULT_TITLE_PT,
  description: "Termos de uso do conteúdo publicado pela People & Growth.",
};

export default async function DireitosAutoraisPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "direitos-autorais").single();

  const title = pickLocale(locale, data?.title_pt, data?.title_en) || (locale === "en" ? DEFAULT_TITLE_EN : DEFAULT_TITLE_PT);
  const body = pickLocale(locale, data?.body_pt, data?.body_en) || (locale === "en" ? DEFAULT_BODY_EN : DEFAULT_BODY_PT);

  return (
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
  );
}
