import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Regras de Uso dos Comentários",
  description: "Regras para comentar nos artigos da People & Growth.",
};

const rules: string[] = [
  "O autor do comentário, e não a People & Growth, é o responsável pelo que escreve. Publicamos comentários assinados por quem os envia, não pela redação.",
  "Todo comentário passa por moderação antes de ser publicado. Isso pode levar algumas horas, e nem todo comentário enviado é aprovado.",
  "Não publicamos comentários com discurso de ódio, ameaças, assédio ou ataques pessoais a outros leitores, colunistas ou terceiros.",
  "Não publicamos comentários com conteúdo ilegal, discriminatório, ou que incentivem violência.",
  "Não publicamos spam, propaganda, links suspeitos ou divulgação de dados pessoais de terceiros.",
  "Comentários fora do tema do artigo ou repetidos em vários artigos podem ser removidos.",
  "A People & Growth pode remover, editar a exibição ou recusar qualquer comentário, a seu critério, sem necessidade de justificar a decisão a quem o enviou.",
  "O e-mail informado no formulário de comentário não é publicado — serve apenas para eventual contato sobre a própria mensagem, conforme nossas ",
];

export default function RegrasComentariosPage() {
  return (
    <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
      <div className="container-xl" style={{ maxWidth: "720px" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
          Regras de Uso dos Comentários
        </h1>
        <p style={{ color: "var(--site-muted)", fontSize: "1rem", marginBottom: "2.5rem" }}>
          Última atualização: {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>

        <p style={{ color: "var(--site-text-secondary)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
          A People &amp; Growth mantém um espaço de comentários para que leitores possam reagir e discutir os artigos publicados. Para que esse espaço funcione bem para todo mundo, pedimos que sejam seguidas as regras abaixo.
        </p>

        <ol style={{ display: "flex", flexDirection: "column", gap: "1.25rem", paddingLeft: "1.25rem", color: "var(--site-text-secondary)" }}>
          {rules.map((rule, i) => (
            <li key={i} style={{ lineHeight: 1.75 }}>
              {rule}
              {i === rules.length - 1 && (
                <Link href="/normas-de-seguranca-e-privacidade" style={{ color: "#4361EE", fontWeight: 600 }}>
                  Normas de Segurança e Privacidade
                </Link>
              )}
              {i === rules.length - 1 && "."}
            </li>
          ))}
        </ol>

        <p style={{ color: "var(--site-text-secondary)", lineHeight: 1.75, marginTop: "2rem" }}>
          Encontrou um comentário que viola essas regras? Avise a gente pela página de{" "}
          <Link href="/contato" style={{ color: "#4361EE", fontWeight: 600 }}>
            Contato
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
