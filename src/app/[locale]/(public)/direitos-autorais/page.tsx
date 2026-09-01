import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de Direitos Autorais",
  description: "Termos de uso do conteúdo publicado pela People & Growth.",
};

const sections: { title: string; body: string }[] = [
  {
    title: "Titularidade do conteúdo",
    body: "Os textos, imagens, vídeos e demais materiais publicados pela People & Growth — incluindo artigos, a coluna Mea Sententia e páginas institucionais — são de titularidade da People & Growth ou de seus autores, e protegidos pela legislação brasileira de direitos autorais (Lei nº 9.610/1998), salvo quando indicada outra fonte.",
  },
  {
    title: "Uso permitido",
    body: "É permitido compartilhar links para o nosso conteúdo e citar trechos curtos, desde que citada a fonte com link para o artigo original. Reprodução integral de artigos, sem autorização prévia, não é permitida.",
  },
  {
    title: "Materiais de terceiros",
    body: "Imagens e vídeos incorporados de terceiros (como YouTube) pertencem a seus respectivos autores ou licenciantes e são utilizados conforme os termos de uso das plataformas de origem.",
  },
  {
    title: "Solicitações e denúncias",
    body: "Caso identifique conteúdo nosso publicado indevidamente em outro site, ou acredite que publicamos algo que viola direitos autorais de terceiros, entre em contato pelo e-mail informado na página de Contato.",
  },
];

export default function DireitosAutoraisPage() {
  return (
    <section className="section-padding" style={{ backgroundColor: "white" }}>
      <div className="container-xl" style={{ maxWidth: "720px" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.75rem" }}>
          Aviso de Direitos Autorais
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
