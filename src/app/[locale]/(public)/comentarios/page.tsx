import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const revalidate = 300;

const DEFAULT_TITLE = "Regras de Uso dos Comentários";
const DEFAULT_BODY = `A People & Growth mantém um espaço de comentários para que leitores possam reagir e discutir os artigos publicados. Para que esse espaço funcione bem para todo mundo, pedimos que sejam seguidas as regras abaixo.

1. O autor do comentário, e não a People & Growth, é o responsável pelo que escreve. Publicamos comentários assinados por quem os envia, não pela redação.
2. Todo comentário passa por moderação antes de ser publicado. Isso pode levar algumas horas, e nem todo comentário enviado é aprovado.
3. Não publicamos comentários com discurso de ódio, ameaças, assédio ou ataques pessoais a outros leitores, colunistas ou terceiros.
4. Não publicamos comentários com conteúdo ilegal, discriminatório, ou que incentivem violência.
5. Não publicamos spam, propaganda, links suspeitos ou divulgação de dados pessoais de terceiros.
6. Comentários fora do tema do artigo ou repetidos em vários artigos podem ser removidos.
7. A People & Growth pode remover, editar a exibição ou recusar qualquer comentário, a seu critério, sem necessidade de justificar a decisão a quem o enviou.
8. O e-mail informado no formulário de comentário não é publicado — serve apenas para eventual contato sobre a própria mensagem, conforme nossas [Normas de Segurança e Privacidade](/normas-de-seguranca-e-privacidade).

Encontrou um comentário que viola essas regras? Avise a gente pela [página de Contato](/contato).`;

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: "Regras para comentar nos artigos da People & Growth.",
};

export default async function RegrasComentariosPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "comentarios").single();

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
