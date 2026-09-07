// Generates the "Linha fina" (excerpt) and "Resumo em destaque" (summary)
// fields from an article's title + body, using the Gemini API — the editor
// picks what actually matters in the piece instead of a mechanical
// first-sentence truncation. Feeds the model plain prose (via
// stripMarkdownLite) so it judges the article's substance, not its markup.

import { callGeminiJson } from "./gemini-client";
import { stripMarkdownLite } from "./markdown-lite";

export type ExcerptSummaryInput = {
  title_pt: string;
  content_pt: string;
};

export type ExcerptSummaryOutput = {
  excerpt_pt: string;
  summary_pt: string;
};

const PROMPT_INSTRUCTIONS = `You are an editor for a Brazilian Portuguese business/growth news and consulting site. Read the article below and write two short editorial texts in Brazilian Portuguese:

1. "excerpt_pt" — a one-sentence subtitle/dek (roughly 120-160 characters), plain prose, no markdown formatting. It appears under the headline in article listings, cards, and as the search-engine description. It must NOT just restate the title in other words — it should add the specific angle, stake, or detail that makes someone want to read further.

2. "summary_pt" — 3 to 5 bullet points for a "Resumo" box shown at the top of the article, letting a reader who won't read the whole piece get the real substance in a glance. Prioritize by actual weight: the main argument or finding, the most concrete facts/data/names mentioned, and the conclusion or takeaway — not just the opening paragraph reworded, and not minor color or examples that aren't load-bearing for the article's point. Each bullet is one short, complete sentence or clause. Format: each bullet starts with "• " (that exact character, a bullet, followed by one space), one bullet per line separated by a single "\\n" newline character, nothing else on the line (no "-", no numbers, no markdown "**" or other formatting).

Both must be faithful to the article — do not invent facts, numbers, or claims that aren't in the text.

Return ONLY the JSON object matching the given schema — no extra commentary, no markdown code fences, no surrounding quotes.`;

function buildPrompt(input: ExcerptSummaryInput): string {
  return `${PROMPT_INSTRUCTIONS}

TITLE:
${input.title_pt}

ARTICLE BODY:
${stripMarkdownLite(input.content_pt)}`;
}

export async function generateExcerptAndSummary(input: ExcerptSummaryInput): Promise<ExcerptSummaryOutput> {
  const parsed = await callGeminiJson<ExcerptSummaryOutput>(
    buildPrompt(input),
    {
      type: "OBJECT",
      properties: {
        excerpt_pt: { type: "STRING" },
        summary_pt: { type: "STRING" },
      },
      required: ["excerpt_pt", "summary_pt"],
    },
    "Geração automática de resumo"
  );

  if (!parsed.excerpt_pt || !parsed.summary_pt) {
    throw new Error("A geração automática veio incompleta. Tente novamente.");
  }

  return parsed;
}
