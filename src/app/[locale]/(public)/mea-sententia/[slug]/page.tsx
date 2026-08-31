import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";

const articles: Record<string, {
  title: string;
  content: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: number;
  tags: string[];
}> = {
  "ia-estrategia-growth": {
    title: "Como usar IA para acelerar sua estratégia de Growth",
    category: "IA",
    categoryColor: "#FFB703",
    date: "18 Jun 2025",
    readTime: 8,
    tags: ["IA", "Growth", "Estratégia"],
    content: `
A inteligência artificial não é mais uma promessa futura — ela já está transformando a forma como empresas crescem. E quem souber usá-la estrategicamente vai ter uma vantagem competitiva enorme nos próximos anos.

## O que mudou com a IA generativa

Até 2022, IA aplicada ao crescimento de negócios era domínio de empresas com times de dados robustos. Hoje, com modelos como GPT-4, Claude e Gemini, qualquer profissional consegue usar IA para acelerar processos críticos de growth.

**Os três pilares que estou observando nos negócios que crescem com IA:**

1. **Geração e qualificação de leads mais inteligente** — agentes de IA que pesquisam, qualificam e personalizam a abordagem para cada lead antes de qualquer interação humana.

2. **Produção de conteúdo escalável** — não se trata de substituir a voz da marca, mas de usar IA para acelerar o processo criativo, escalar distribuição e personalizar mensagens por segmento.

3. **Análise de dados em tempo real** — com ferramentas como o Code Interpreter do ChatGPT, qualquer gestor consegue analisar planilhas e extrair insights sem precisar de um analista dedicado.

## Como aplicar na prática

O erro mais comum é usar IA de forma isolada — um prompt aqui, um texto gerado ali. O que diferencia empresas que crescem com IA é a integração estratégica.

**Framework que uso com clientes:**

- **Mapear os gargalos do funil** onde IA pode ter maior impacto (geralmente em topo de funil e análise de dados)
- **Criar workflows automatizados** com n8n ou Make que integram IA ao CRM e às ferramentas de marketing
- **Medir o impacto** com KPIs claros antes e depois da implementação

A IA não cresce negócios. Estrategistas que usam IA como alavanca, esses sim crescem negócios.
    `.trim(),
  },
  "okrs-na-pratica": {
    title: "OKRs na prática: como definir metas que realmente funcionam",
    category: "Estratégia",
    categoryColor: "#4361EE",
    date: "10 Mai 2025",
    readTime: 6,
    tags: ["OKR", "Estratégia", "Gestão"],
    content: `
OKR (Objectives and Key Results) é uma das metodologias de gestão mais poderosas que existem — e uma das mais mal implementadas.

## Por que os OKRs falham

Depois de ajudar mais de 20 empresas a implementarem OKRs, identifiquei três padrões de falha:

1. **OKRs como lista de tarefas** — em vez de resultados, as empresas definem atividades.
2. **Cascata engessada** — OKRs de cima para baixo sem espaço para times criarem seus próprios objetivos.
3. **Sem cadência de revisão** — definir no início do trimestre e revisar só no final não funciona.

## O que funciona de verdade

Um OKR bem escrito tem um Objetivo inspirador (qualitativo) e Key Results mensuráveis (quantitativos).

**Exemplo ruim:**
- O: Melhorar o marketing
- KR: Criar 10 posts por mês

**Exemplo bom:**
- O: Tornar-nos a referência em Marketing Digital para PMEs do setor financeiro
- KR 1: Alcançar 10.000 visitantes únicos/mês no blog até setembro
- KR 2: Gerar 200 leads qualificados via conteúdo no trimestre
- KR 3: Atingir NPS de 70+ com clientes atuais

A diferença? O segundo define onde você quer chegar, não o que você vai fazer para chegar lá.
    `.trim(),
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return { title: "Artigo não encontrado" };
  return {
    title: article.title,
    description: `Artigo da Mea Sententia por Thiago Leal — ${article.category}`,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const article = articles[slug];

  if (!article) {
    return (
      <div className="container-xl section-padding" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", color: "#0d1b2a", marginBottom: "1rem" }}>Artigo não encontrado</h1>
        <Link href="/mea-sententia" style={{ color: "#4361EE", fontWeight: 600 }}>
          ← Voltar para Mea Sententia
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)",
          paddingTop: "6rem",
          paddingBottom: "4rem",
          color: "white",
        }}
      >
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          <Link
            href="/mea-sententia"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Mea Sententia
          </Link>

          <span
            style={{
              display: "inline-block",
              backgroundColor: `${article.categoryColor}25`,
              color: article.categoryColor,
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 700,
              marginBottom: "1.25rem",
            }}
          >
            {article.category}
          </span>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 5vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "1.5rem",
            }}
          >
            {article.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Calendar size={14} /> {article.date}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Clock size={14} /> {article.readTime} min de leitura
            </span>
            <span>Por Thiago Leal</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding" style={{ backgroundColor: "white" }}>
        <div
          className="container-xl"
          style={{
            maxWidth: "1100px",
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "4rem",
            alignItems: "start",
          }}
        >
          {/* Article body */}
          <article>
            <div
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.85,
                color: "#374151",
              }}
              dangerouslySetInnerHTML={{
                __html: article.content
                  .replace(/^## (.+)$/gm, '<h2 style="font-size:1.5rem;font-weight:800;color:#0d1b2a;margin:2rem 0 1rem">$1</h2>')
                  .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:#0d1b2a">$1</strong>')
                  .replace(/\n\n/g, '</p><p style="margin:0 0 1.25rem">')
                  .replace(/^- (.+)$/gm, '<li style="margin-bottom:0.5rem">$1</li>')
                  .replace(/(<li[^>]*>[\s\S]*?<\/li>)/g, '<ul style="padding-left:1.5rem;margin:1rem 0">$1</ul>')
                  .replace(/^(\d+)\. (.+)$/gm, '<li style="margin-bottom:0.5rem"><strong>$2</strong></li>')
                  .replace(/^(.+)$/, '<p style="margin:0 0 1.25rem">$1'),
              }}
            />

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid #e2e8f0" }}>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: "#f0f4f8",
                    color: "#475569",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author */}
            <div
              style={{
                marginTop: "2.5rem",
                padding: "1.75rem",
                backgroundColor: "#f0f4f8",
                borderRadius: "1rem",
                display: "flex",
                gap: "1.25rem",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "4rem",
                  height: "4rem",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4361EE, #06D6A0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  flexShrink: 0,
                }}
              >
                👤
              </div>
              <div>
                <div style={{ fontWeight: 800, color: "#0d1b2a", fontSize: "1rem", marginBottom: "0.25rem" }}>
                  Thiago Leal
                </div>
                <div style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  Fundador da People & Growth · Especialista em Marketing, Growth e IA
                </div>
                <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  Consultor estratégico com mais de 7 anos de experiência em Marketing Digital, Growth e Inteligência Artificial.
                </p>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "5rem" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                borderRadius: "1rem",
                padding: "1.75rem",
                color: "white",
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem" }}>
                ✍️ Gostou do artigo?
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                Assine a Mea Sententia e receba perspectivas como essa toda semana.
              </p>
              <NewsletterForm compact />
            </div>

            <div
              style={{
                backgroundColor: "#f0f4f8",
                borderRadius: "1rem",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0d1b2a", marginBottom: "1rem" }}>
                Precisa de consultoria?
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Ajudo empresas a crescerem com Marketing, Growth e IA.
              </p>
              <Link
                href="/contato"
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: "#4361EE",
                  color: "white",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.625rem",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Agendar conversa
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
