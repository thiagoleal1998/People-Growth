import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Como o site People & Growth usa cookies.",
};

const sections: { title: string; body: string }[] = [
  {
    title: "O que são cookies",
    body: "Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles ajudam o site a lembrar informações sobre sua visita, como preferências e sessões de login.",
  },
  {
    title: "Quais cookies usamos",
    body: "Usamos apenas cookies essenciais, necessários para o funcionamento do site — por exemplo, o cookie de sessão que mantém o login do painel administrativo. Não usamos cookies de rastreamento, publicidade ou de terceiros para monitorar sua navegação.",
  },
  {
    title: "Armazenamento local do navegador",
    body: "Guardamos localmente, no seu navegador, a informação de que você já visualizou o aviso de cookies, para não exibi-lo novamente. Esse dado fica apenas no seu dispositivo e não é enviado para nossos servidores.",
  },
  {
    title: "Seus direitos (LGPD)",
    body: "De acordo com a Lei Geral de Proteção de Dados (LGPD), você pode solicitar informações sobre os dados que tratamos, bem como sua correção ou exclusão. Entre em contato pelo e-mail informado na página de Contato para exercer esses direitos.",
  },
  {
    title: "Alterações nesta política",
    body: "Esta política pode ser atualizada caso o site passe a usar novos cookies ou ferramentas de terceiros. Recomendamos revisitar esta página periodicamente.",
  },
];

export default function CookiesPage() {
  return (
    <section className="section-padding" style={{ backgroundColor: "white" }}>
      <div className="container-xl" style={{ maxWidth: "720px" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.75rem" }}>
          Política de Cookies
        </h1>
        <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "2.5rem" }}>
          Última atualização: {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0d1b2a", marginBottom: "0.625rem" }}>{s.title}</h2>
              <p style={{ color: "#475569", lineHeight: 1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
