// Shared low-level Gemini call used by both translate.ts and summarize.ts —
// same model, same retry behavior, same "ask for structured JSON back"
// pattern, just different prompts/schemas per caller.

const MODEL = "gemini-flash-latest";
const MAX_ATTEMPTS = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The flash-tier model occasionally returns 503 "high demand" under normal
// use — a transient overload, not a real failure — so a couple of retries
// with backoff avoids surfacing a spurious error for something that
// succeeds a few seconds later.
async function callGemini(apiKey: string, body: string): Promise<Response> {
  let lastRes: Response | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (res.ok || res.status !== 503) return res;
    lastRes = res;
    if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
  }
  return lastRes!;
}

export async function callGeminiJson<T>(prompt: string, responseSchema: Record<string, unknown>, errorLabel: string): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(`${errorLabel} não está configurado (GEMINI_API_KEY ausente).`);
  }

  const res = await callGemini(
    apiKey,
    JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema },
    })
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Gemini request failed (${errorLabel}):`, res.status, errText);
    throw new Error(
      res.status === 503
        ? "O serviço de IA está sobrecarregado no momento. Tente de novo em alguns instantes."
        : `Falha ao chamar o serviço de IA (${errorLabel}). Tente novamente.`
    );
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error(`Gemini returned no text (${errorLabel}):`, JSON.stringify(data).slice(0, 500));
    throw new Error("O serviço de IA não retornou nenhum conteúdo.");
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    console.error(`Gemini returned invalid JSON (${errorLabel}):`, text.slice(0, 500), err);
    throw new Error("A resposta da IA veio em um formato inesperado. Tente novamente.");
  }
}
