// Translates an article's PT fields to EN using the Gemini API, preserving
// the markdown-lite dialect (markdown-lite.ts) exactly — headings, lists,
// bold/italic/underline, blockquotes, and especially image/gif/link syntax
// (![alt](url "credito" "fonte"), !gif[...], [text](url)) must survive
// untouched except for the human-language text inside them. Structural
// counts (paragraph blocks, image/link markers) are checked after the call
// so a mangled translation is caught instead of silently saved.

import { callGeminiJson } from "./gemini-client";

export type ArticleTranslationInput = {
  title_pt: string;
  excerpt_pt: string;
  summary_pt: string;
  content_pt: string;
};

export type ArticleTranslationOutput = {
  title_en: string;
  excerpt_en: string;
  summary_en: string;
  content_en: string;
};

const PROMPT_INSTRUCTIONS = `You are a professional PT-BR to English translator for a business/growth news and consulting site. Translate the four fields below from Brazilian Portuguese into natural, fluent, accurate English. Preserve the original meaning, tone, and nuance precisely — this is professional editorial content, not a literal word-for-word translation. Do not summarize, shorten, or add content that isn't in the source.

The "content" field uses a small custom markdown dialect. You MUST preserve its syntax exactly, character for character, translating ONLY the human-readable text:
- "**bold**", "_italic_", "++underline++" — keep the markers, translate the text inside.
- "## Heading" and "### Smaller heading" — keep the "##"/"###" prefix, translate the heading text.
- "- item" (bullet list) and "1. item" (numbered list) — keep the markers, translate each item's text.
- "> quoted text" and an optional following "> — Attribution" line — translate the quoted text, but NEVER translate the attribution name after "— " (it's a person's name).
- "![alt text](url \"credit\" \"source\")" and "!gif[alt text](url \"credit\" \"source\")" — NEVER change the url. Translate ONLY the alt text in the square brackets. The two optional quoted values after the url are a photo credit and a publication/source name — leave them exactly as-is, do not translate names or publication names.
- "[link text](url)" — NEVER change the url, translate only the visible link text.
- Preserve the exact paragraph structure: the same number of blank-line-separated paragraphs/blocks, in the same order, with nothing added or removed.

Do not translate proper nouns, brand names, or publication/outlet names anywhere (titles, excerpt, summary, or content).

Return ONLY the JSON object matching the given schema — no extra commentary, no markdown code fences.`;

function buildPrompt(input: ArticleTranslationInput): string {
  return `${PROMPT_INSTRUCTIONS}

TITLE (PT):
${input.title_pt}

EXCERPT (PT):
${input.excerpt_pt}

SUMMARY (PT):
${input.summary_pt}

CONTENT (PT):
${input.content_pt}`;
}

// Rough structural fingerprint used to sanity-check the translation didn't
// drop/duplicate paragraphs or corrupt image/link syntax — not a full
// diff, just enough to catch a badly mangled response before it's saved.
function structuralFingerprint(content: string): { paragraphs: number; images: number; links: number } {
  return {
    paragraphs: content.split(/\n\n+/).filter((b) => b.trim()).length,
    images: (content.match(/!(?:gif)?\[[^\]]*\]\(/g) ?? []).length,
    links: (content.match(/(?<!!)\[[^\]]+\]\(/g) ?? []).length,
  };
}

export async function translateArticleToEnglish(input: ArticleTranslationInput): Promise<ArticleTranslationOutput> {
  const parsed = await callGeminiJson<ArticleTranslationOutput>(
    buildPrompt(input),
    {
      type: "OBJECT",
      properties: {
        title_en: { type: "STRING" },
        excerpt_en: { type: "STRING" },
        summary_en: { type: "STRING" },
        content_en: { type: "STRING" },
      },
      required: ["title_en", "excerpt_en", "summary_en", "content_en"],
    },
    "Tradução automática"
  );

  if (!parsed.title_en || !parsed.content_en) {
    throw new Error("A tradução veio incompleta. Tente novamente.");
  }

  const before = structuralFingerprint(input.content_pt);
  const after = structuralFingerprint(parsed.content_en);
  if (before.paragraphs !== after.paragraphs || before.images !== after.images || before.links !== after.links) {
    console.error("Translation structural mismatch:", { before, after });
    throw new Error(
      "A tradução pode ter alterado a estrutura do texto (parágrafos, imagens ou links não batem com o original). Revise o conteúdo em PT e tente de novo."
    );
  }

  return parsed;
}
