import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { pickLocale } from "@/lib/locale-content";

export const revalidate = 300;

const DEFAULT_TITLE_PT = "Regras de Uso dos Comentários";
const DEFAULT_TITLE_EN = "Comment Guidelines";
const DEFAULT_BODY_PT = `A People & Growth mantém um espaço de comentários para que leitores possam reagir e discutir os artigos publicados. Para que esse espaço funcione bem para todo mundo, pedimos que sejam seguidas as regras abaixo.

1. O autor do comentário, e não a People & Growth, é o responsável pelo que escreve. Publicamos comentários assinados por quem os envia, não pela redação.
2. Todo comentário passa por moderação antes de ser publicado. Isso pode levar algumas horas, e nem todo comentário enviado é aprovado.
3. Não publicamos comentários com discurso de ódio, ameaças, assédio ou ataques pessoais a outros leitores, colunistas ou terceiros.
4. Não publicamos comentários com conteúdo ilegal, discriminatório, ou que incentivem violência.
5. Não publicamos spam, propaganda, links suspeitos ou divulgação de dados pessoais de terceiros.
6. Comentários fora do tema do artigo ou repetidos em vários artigos podem ser removidos.
7. A People & Growth pode remover, editar a exibição ou recusar qualquer comentário, a seu critério, sem necessidade de justificar a decisão a quem o enviou.
8. O e-mail informado no formulário de comentário não é publicado — serve apenas para eventual contato sobre a própria mensagem, conforme nossas [Normas de Segurança e Privacidade](/normas-de-seguranca-e-privacidade).

Encontrou um comentário que viola essas regras? Avise a gente pela [página de Contato](/contato).`;
const DEFAULT_BODY_EN = `People & Growth maintains a comment space so readers can react to and discuss published articles. For this space to work well for everyone, we ask that the rules below be followed.

1. The author of the comment, not People & Growth, is responsible for what they write. We publish comments signed by whoever sends them, not by the editorial team.
2. Every comment goes through moderation before being published. This can take a few hours, and not every submitted comment is approved.
3. We do not publish comments containing hate speech, threats, harassment, or personal attacks against other readers, columnists or third parties.
4. We do not publish comments with illegal or discriminatory content, or content that incites violence.
5. We do not publish spam, advertising, suspicious links, or disclosure of third parties' personal data.
6. Comments off-topic from the article, or repeated across multiple articles, may be removed.
7. People & Growth may remove, edit the display of, or decline any comment at its discretion, with no obligation to justify the decision to whoever submitted it.
8. The email provided in the comment form is not published — it's used only for possible contact about the message itself, per our [Security and Privacy Standards](/normas-de-seguranca-e-privacidade).

Found a comment that violates these rules? Let us know via the [Contact page](/contato).`;

export const metadata: Metadata = {
  title: DEFAULT_TITLE_PT,
  description: "Regras para comentar nos artigos da People & Growth.",
};

export default async function RegrasComentariosPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "comentarios").single();

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
