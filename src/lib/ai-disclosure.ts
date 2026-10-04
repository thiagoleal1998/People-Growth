// Declarations of AI use shown at the end of an article, before its sources.
// The text follows the categories the author ticks in the editor: a single
// category gets its own declaration, a pair or a set of categories gets the
// combined wording, and anything not covered falls back to the default one.

export const AI_USAGE_OPTIONS = [
  { value: "revisao", label: "Revisão textual" },
  { value: "aprimoramento", label: "Aprimoramento textual" },
  { value: "estruturacao", label: "Estruturação do conteúdo" },
  { value: "redacao", label: "Apoio na redação" },
  { value: "pesquisa", label: "Pesquisa e organização de informações" },
  { value: "analise", label: "Análise de dados" },
  { value: "combinado", label: "Uso combinado / múltiplas etapas" },
] as const;

type Declaration = { pt: string; en: string };

const DECLARATIONS = {
  revisao: {
    pt: "Este artigo foi revisado com o apoio de inteligência artificial para aprimoramento textual. O conteúdo e as opiniões apresentadas são de responsabilidade do autor.",
    en: "This article was reviewed with the support of artificial intelligence for textual improvement. The content and opinions presented are the responsibility of the author.",
  },
  revisaoAprimoramento: {
    pt: "Este artigo contou com o apoio de inteligência artificial para revisão e aprimoramento textual. O conteúdo final foi revisado e validado pelo autor.",
    en: "This article was supported by artificial intelligence for textual review and improvement. The final content was reviewed and validated by the author.",
  },
  estruturacao: {
    pt: "Este artigo contou com o apoio de inteligência artificial na estruturação e organização do conteúdo. O texto final foi revisado e validado pelo autor.",
    en: "This article was supported by artificial intelligence in structuring and organizing the content. The final text was reviewed and validated by the author.",
  },
  redacao: {
    pt: "Este artigo contou com o apoio de inteligência artificial em etapas de redação e revisão. O conteúdo final foi revisado e validado pelo autor.",
    en: "This article was supported by artificial intelligence in writing and review stages. The final content was reviewed and validated by the author.",
  },
  pesquisa: {
    pt: "Este artigo contou com o apoio de inteligência artificial na pesquisa e organização de informações. As informações utilizadas foram revisadas e verificadas pelo autor, que é responsável pelo conteúdo final publicado.",
    en: "This article was supported by artificial intelligence in researching and organizing information. The information used was reviewed and verified by the author, who is responsible for the final published content.",
  },
  analise: {
    pt: "Este artigo contou com o apoio de inteligência artificial na análise e interpretação de dados. Os resultados e conclusões apresentados foram revisados e validados pelo autor.",
    en: "This article was supported by artificial intelligence in data analysis and interpretation. The results and conclusions presented were reviewed and validated by the author.",
  },
  combinado: {
    pt: "Este artigo contou com o apoio de inteligência artificial em diferentes etapas de seu processo de produção. O conteúdo final foi revisado e validado pelo autor.",
    en: "This article was supported by artificial intelligence at different stages of its production process. The final content was reviewed and validated by the author.",
  },
  padrao: {
    pt: "Este artigo contou com o apoio de inteligência artificial em seu processo de produção e revisão. O conteúdo final foi revisado e validado pelo autor.",
    en: "This article was supported by artificial intelligence in its production and review process. The final content was reviewed and validated by the author.",
  },
} satisfies Record<string, Declaration>;

export function aiDisclosureText(usage: string[] | null | undefined, locale: string): string | null {
  const selected = new Set(usage ?? []);
  if (selected.size === 0) return null;

  let key: keyof typeof DECLARATIONS;
  if (selected.has("combinado") || selected.size >= 3) {
    key = "combinado";
  } else if (selected.size === 1) {
    key = selected.has("revisao") ? "revisao" : selected.has("aprimoramento") ? "revisaoAprimoramento" : selected.has("estruturacao") ? "estruturacao" : selected.has("redacao") ? "redacao" : selected.has("pesquisa") ? "pesquisa" : selected.has("analise") ? "analise" : "padrao";
  } else if (selected.size === 2 && selected.has("revisao") && selected.has("aprimoramento")) {
    key = "revisaoAprimoramento";
  } else {
    key = "padrao";
  }

  return locale === "en" ? DECLARATIONS[key].en : DECLARATIONS[key].pt;
}
