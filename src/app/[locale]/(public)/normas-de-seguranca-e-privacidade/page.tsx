import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { pickLocale } from "@/lib/locale-content";

export const revalidate = 300;

const DEFAULT_TITLE_PT = "Normas de Segurança e Privacidade";
const DEFAULT_TITLE_EN = "Security and Privacy Standards";
const DEFAULT_BODY_PT = `## Quais dados coletamos
Ao comentar em um artigo ou preencher um formulário no site (contato, newsletter), coletamos apenas o necessário para viabilizar aquele serviço: nome, e-mail e o conteúdo enviado. Não pedimos dados sensíveis e não é preciso criar conta ou senha.

## Como usamos esses dados
O e-mail informado em um comentário serve só para eventual contato sobre a própria mensagem e não é publicado nem compartilhado. Dados de formulários são usados exclusivamente para responder ao contato ou enviar a newsletter, quando o cadastro é feito voluntariamente.

## Com quem compartilhamos
Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins de marketing. Os dados ficam armazenados em infraestrutura de nuvem (Supabase) com acesso restrito à equipe da People & Growth.

## Moderação de comentários
Todo comentário passa por revisão antes de ser publicado. Isso significa que, entre o envio e a publicação, seu comentário e e-mail ficam visíveis apenas para a equipe responsável pela moderação.

## Base legal e retenção (LGPD)
Tratamos esses dados com base no consentimento dado ao enviar o formulário e no legítimo interesse em manter um espaço de comentários seguro. Mantemos os dados pelo tempo necessário para essa finalidade ou até que você solicite a exclusão.

## Seus direitos
Você pode solicitar a qualquer momento a exclusão do seu comentário, a correção de dados ou informações sobre o que armazenamos, entrando em contato pela [página de Contato](/contato).

## Cookies
O uso de cookies no site é tratado separadamente na nossa [Política de Cookies](/cookies).`;
const DEFAULT_BODY_EN = `## What data we collect
When you comment on an article or fill in a form on the site (contact, newsletter), we only collect what's needed to provide that service: name, email and the content you send. We don't ask for sensitive data, and no account or password is required.

## How we use this data
The email given in a comment is only used for possible follow-up about that message itself and is never published or shared. Form data is used exclusively to respond to your contact request or send the newsletter, when you sign up voluntarily.

## Who we share it with
We do not sell, rent or share personal data with third parties for marketing purposes. Data is stored on cloud infrastructure (Supabase) with access restricted to the People & Growth team.

## Comment moderation
Every comment is reviewed before publication. This means that, between submission and publication, your comment and email are visible only to the team responsible for moderation.

## Legal basis and retention (LGPD)
We process this data based on the consent given when submitting the form and on the legitimate interest in keeping a safe comment space. We keep the data for as long as necessary for that purpose, or until you request its deletion.

## Your rights
You can request at any time the deletion of your comment, correction of data, or information about what we store, by contacting us via the [Contact page](/contato).

## Cookies
The use of cookies on the site is covered separately in our [Cookie Policy](/cookies).`;

export const metadata: Metadata = {
  title: DEFAULT_TITLE_PT,
  description: "Como a People & Growth trata os dados enviados no site, incluindo comentários e formulários.",
};

export default async function NormasSegurancaPrivacidadePage() {
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "normas-de-seguranca-e-privacidade").single();

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
