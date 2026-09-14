import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { pickLocale } from "@/lib/locale-content";

export const revalidate = 300;

const DEFAULT_TITLE_PT = "Termos de Uso";
const DEFAULT_TITLE_EN = "Terms of Use";
const DEFAULT_BODY_PT = `## Aceitação dos termos
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
const DEFAULT_BODY_EN = `## Acceptance of terms
By accessing and using the People & Growth website, you agree to these Terms of Use. If you disagree with any part, please do not use the site.

## About the content
The articles, analyses and materials published here — including those in the Mea Sententia section — represent the opinion of their authors and are informational in nature. They do not constitute individualized professional advice (legal, financial, accounting or otherwise) for any reader's specific situation.

## Intellectual property
Text, images, brand and other site materials are the property of People & Growth or licensed third parties, protected by copyright. Full or partial reproduction without prior authorization is not permitted — see also our [Copyright Notice](/direitos-autorais).

## Comments and user conduct
By commenting on an article, you agree not to post offensive, illegal, defamatory content or content that violates third-party rights. We reserve the right to moderate, edit or remove comments that break these rules — see the [Comment Guidelines](/comentarios) for more details.

## Limitation of liability
The site is provided "as is". We do our best to keep the information up to date and accurate, but we do not guarantee the content is error-free at all times, nor are we liable for decisions made solely based on what is published here.

## External links
We may link to third-party sites for convenience. We are not responsible for the content, policies or practices of those sites.

## Changes to these terms
We may update these Terms of Use periodically. The version in effect is always the one published on this page, with the last-updated date shown at the top.

## Applicable law
These terms are governed by the laws of the Federative Republic of Brazil. Questions can be sent via the [Contact page](/contato).`;

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
