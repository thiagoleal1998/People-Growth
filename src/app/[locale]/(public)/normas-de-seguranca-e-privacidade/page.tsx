import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";

export const revalidate = 300;

const DEFAULT_TITLE = "Normas de Segurança e Privacidade";
const DEFAULT_BODY = `## Quais dados coletamos
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

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: "Como a People & Growth trata os dados enviados no site, incluindo comentários e formulários.",
};

export default async function NormasSegurancaPrivacidadePage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "normas-de-seguranca-e-privacidade").single();

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
