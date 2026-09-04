import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";

export const revalidate = 300;

const DEFAULT_TITLE = "Termos de Uso";
const DEFAULT_BODY = `## Aceitação dos termos
Ao acessar e usar o site da People & Growth, você concorda com estes Termos de Uso. Se não concordar com algum ponto, pedimos que não utilize o site.

## Sobre o conteúdo
Os artigos, análises e materiais publicados aqui — incluindo os da seção Mea Sententia — representam a opinião de seus autores e têm caráter informativo. Não constituem aconselhamento profissional individualizado (jurídico, financeiro, contábil ou de outra natureza) para o caso concreto de cada leitor.

## Propriedade intelectual
Textos, imagens, marca e demais materiais do site são de propriedade da People & Growth ou de terceiros licenciados, protegidos por direitos autorais. A reprodução total ou parcial sem autorização prévia não é permitida — veja também nosso [Aviso de Direitos Autorais](/direitos-autorais).

## Comentários e conduta do usuário
Ao comentar em um artigo, você concorda em não publicar conteúdo ofensivo, ilegal, difamatório ou que viole direitos de terceiros. Reservamo-nos o direito de moderar, editar ou remover comentários que descumpram essas regras — veja as [Regras de Uso dos Comentários](/comentarios) para mais detalhes.

## Limitação de responsabilidade
O site é fornecido "como está". Fazemos o possível para manter as informações atualizadas e corretas, mas não garantimos que o conteúdo esteja livre de erros a qualquer momento, nem nos responsabilizamos por decisões tomadas exclusivamente com base no que é publicado aqui.

## Links externos
Podemos linkar para sites de terceiros por conveniência. Não somos responsáveis pelo conteúdo, políticas ou práticas desses sites.

## Alterações nestes termos
Podemos atualizar estes Termos de Uso periodicamente. A versão vigente é sempre a publicada nesta página, com a data da última atualização indicada no topo.

## Legislação aplicável
Estes termos são regidos pelas leis da República Federativa do Brasil. Dúvidas podem ser enviadas pela [página de Contato](/contato).`;

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: "Regras de uso do site People & Growth, incluindo conteúdo, comentários e propriedade intelectual.",
};

export default async function TermosDeUsoPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "termos-de-uso").single();

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
