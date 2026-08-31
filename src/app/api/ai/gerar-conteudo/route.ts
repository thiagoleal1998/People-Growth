import { NextRequest, NextResponse } from "next/server";

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  linkedin: "LinkedIn: post profissional, 150-300 palavras, parágrafos curtos, poucos emojis, foco em insights e valor",
  instagram: "Instagram: caption engajante, 80-150 palavras, emojis estratégicos, gancho na primeira linha",
  tiktok: "TikTok: roteiro de vídeo de 30-60 segundos (divida em cenas/momentos), legenda curta de 2-3 linhas, energético e direto",
  youtube: "YouTube: título chamativo com 60 caracteres, descrição detalhada de 200-300 palavras com timestamps sugeridos",
};

function buildPrompt(tema: string, plataformas: string[], tom: string, contexto: string): string {
  const instructions = plataformas.map((p) => PLATFORM_INSTRUCTIONS[p]).filter(Boolean).join("\n");

  return `Você é um especialista em marketing de conteúdo e personal branding brasileiro.
Crie conteúdo em português do Brasil para redes sociais.

Tema: ${tema}
${contexto ? `Contexto adicional: ${contexto}` : ""}
Tom de voz: ${tom}

Instruções por plataforma:
${instructions}

Para cada plataforma, inclua:
- Texto principal (caption ou roteiro)
- 8-12 hashtags relevantes em português e inglês (sem o #)
- Melhor horário para publicar (ex: "Terça, 18h-20h")
- Call-to-action direto

Retorne SOMENTE um JSON válido, sem texto antes ou depois:
{
  ${plataformas.includes("linkedin") ? `"linkedin": { "caption": "...", "hashtags": ["..."], "best_time": "...", "cta": "..." }` : ""}
  ${plataformas.includes("linkedin") && plataformas.length > 1 ? "," : ""}
  ${plataformas.includes("instagram") ? `"instagram": { "caption": "...", "hashtags": ["..."], "best_time": "...", "cta": "..." }` : ""}
  ${plataformas.includes("instagram") && plataformas.some((p, i) => i > plataformas.indexOf("instagram")) ? "," : ""}
  ${plataformas.includes("tiktok") ? `"tiktok": { "script": "...", "caption": "...", "hashtags": ["..."], "best_time": "...", "cta": "..." }` : ""}
  ${plataformas.includes("tiktok") && plataformas.includes("youtube") ? "," : ""}
  ${plataformas.includes("youtube") ? `"youtube": { "title": "...", "description": "...", "hashtags": ["..."], "best_time": "...", "cta": "..." }` : ""}
}`;
}

export async function POST(request: NextRequest) {
  try {
    const { tema, plataformas, tom, contexto } = await request.json();

    if (!tema || !plataformas?.length) {
      return NextResponse.json({ error: "Tema e plataformas são obrigatórios" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada. Adicione ao arquivo .env.local (grátis em aistudio.google.com)" },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(tema, plataformas, tom || "Profissional", contexto || "");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text: string = data.candidates[0].content.parts[0].text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Resposta inválida da IA");

    const content = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Erro ao gerar conteúdo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao gerar conteúdo" },
      { status: 500 }
    );
  }
}
