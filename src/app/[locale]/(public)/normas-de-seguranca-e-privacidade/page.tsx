import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Normas de Segurança e Privacidade",
  description: "Como a People & Growth trata os dados enviados no site, incluindo comentários e formulários.",
};

const sections: { title: string; body: string }[] = [
  {
    title: "Quais dados coletamos",
    body: "Ao comentar em um artigo ou preencher um formulário no site (contato, newsletter), coletamos apenas o necessário para viabilizar aquele serviço: nome, e-mail e o conteúdo enviado. Não pedimos dados sensíveis e não é preciso criar conta ou senha.",
  },
  {
    title: "Como usamos esses dados",
    body: "O e-mail informado em um comentário serve só para eventual contato sobre a própria mensagem e não é publicado nem compartilhado. Dados de formulários são usados exclusivamente para responder ao contato ou enviar a newsletter, quando o cadastro é feito voluntariamente.",
  },
  {
    title: "Com quem compartilhamos",
    body: "Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins de marketing. Os dados ficam armazenados em infraestrutura de nuvem (Supabase) com acesso restrito à equipe da People & Growth.",
  },
  {
    title: "Moderação de comentários",
    body: "Todo comentário passa por revisão antes de ser publicado. Isso significa que, entre o envio e a publicação, seu comentário e e-mail ficam visíveis apenas para a equipe responsável pela moderação.",
  },
  {
    title: "Base legal e retenção (LGPD)",
    body: "Tratamos esses dados com base no consentimento dado ao enviar o formulário e no legítimo interesse em manter um espaço de comentários seguro. Mantemos os dados pelo tempo necessário para essa finalidade ou até que você solicite a exclusão.",
  },
  {
    title: "Seus direitos",
    body: "Você pode solicitar a qualquer momento a exclusão do seu comentário, a correção de dados ou informações sobre o que armazenamos, entrando em contato pelo e-mail informado na página de Contato.",
  },
  {
    title: "Cookies",
    body: "O uso de cookies no site é tratado separadamente na nossa ",
  },
];

export default function NormasSegurancaPrivacidadePage() {
  return (
    <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
      <div className="container-xl" style={{ maxWidth: "720px" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
          Normas de Segurança e Privacidade
        </h1>
        <p style={{ color: "var(--site-muted)", fontSize: "1rem", marginBottom: "2.5rem" }}>
          Última atualização: {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--site-text)", marginBottom: "0.625rem" }}>{s.title}</h2>
              <p style={{ color: "var(--site-text-secondary)", lineHeight: 1.75 }}>
                {s.body}
                {s.title === "Cookies" && (
                  <Link href="/cookies" style={{ color: "#4361EE", fontWeight: 600 }}>
                    Política de Cookies
                  </Link>
                )}
                {s.title === "Cookies" && "."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
