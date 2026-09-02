import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";

export const revalidate = 300;

const DEFAULT_TITLE = "Aviso de Direitos Autorais";
const DEFAULT_BODY = `## Titularidade do conteúdo
Os textos, imagens, vídeos e demais materiais publicados pela People & Growth — incluindo artigos, a coluna Mea Sententia e páginas institucionais — são de titularidade da People & Growth ou de seus autores, e protegidos pela legislação brasileira de direitos autorais (Lei nº 9.610/1998), salvo quando indicada outra fonte.

## Uso permitido
É permitido compartilhar links para o nosso conteúdo e citar trechos curtos, desde que citada a fonte com link para o artigo original. Reprodução integral de artigos, sem autorização prévia, não é permitida.

## Materiais de terceiros
Imagens e vídeos incorporados de terceiros (como YouTube) pertencem a seus respectivos autores ou licenciantes e são utilizados conforme os termos de uso das plataformas de origem.

## Solicitações e denúncias
Caso identifique conteúdo nosso publicado indevidamente em outro site, ou acredite que publicamos algo que viola direitos autorais de terceiros, entre em contato pela [página de Contato](/contato).`;

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: "Termos de uso do conteúdo publicado pela People & Growth.",
};

export default async function DireitosAutoraisPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "direitos-autorais").single();

  const title = data?.title_pt || DEFAULT_TITLE;
  const body = data?.body_pt || DEFAULT_BODY;

  return (
    <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
      <div className="container-xl" style={{ maxWidth: "720px" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
          {title}
        </h1>
        <p style={{ color: "var(--site-muted)", fontSize: "1rem", marginBottom: "2.5rem" }}>
          Última atualização: {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>

        <div
          style={{ color: "var(--site-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.75 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownLite(body) }}
        />
      </div>
    </section>
  );
}
