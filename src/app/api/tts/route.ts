import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

// Edge's "Read Aloud" websocket service is free and has no character quota,
// but it's an unofficial consumer endpoint (not a documented, supported
// API) — it could change or get blocked without notice. If that ever
// happens, swap this route's synthesize() for a documented provider
// (Google Cloud TTS's free tier is the natural fallback) without touching
// the player UI, since everything else only depends on this route
// returning { url }.
export const maxDuration = 60;

const BUCKET = "site-assets";
const MAX_CHARS = 20000;
const CHUNK_CHARS = 1800;

const VOICE_BY_LOCALE: Record<string, string> = {
  pt: "pt-BR-ThalitaMultilingualNeural",
  en: "en-US-AvaMultilingualNeural",
};

function escapeSsml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// The service doesn't document a hard per-request length limit, but very
// long single requests are more likely to stall or time out over the
// websocket — splitting at paragraph/sentence boundaries and stitching the
// resulting MP3s back together (same idea browsers use for "Read Aloud" on
// long pages) keeps every individual turn short.
function chunkText(text: string, maxLen = CHUNK_CHARS): string[] {
  const paragraphs = text.split(/\n+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n${paragraph}` : paragraph;
    if (candidate.length <= maxLen) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    if (paragraph.length <= maxLen) {
      current = paragraph;
      continue;
    }
    // A single paragraph longer than the limit — break on sentence
    // boundaries instead.
    let remaining = paragraph;
    while (remaining.length > maxLen) {
      let cut = remaining.lastIndexOf(". ", maxLen);
      if (cut < maxLen * 0.4) cut = remaining.lastIndexOf(" ", maxLen);
      if (cut <= 0) cut = maxLen;
      chunks.push(remaining.slice(0, cut + 1).trim());
      remaining = remaining.slice(cut + 1).trim();
    }
    current = remaining;
  }
  if (current) chunks.push(current);
  return chunks;
}

async function synthesizeOnce(text: string, voice: string): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  try {
    // Chunks share one websocket connection but synthesize concurrently
    // (each gets its own request id) — order is preserved by Promise.all,
    // not by arrival.
    const buffers = await Promise.all(
      chunkText(text).map(async (chunk) => {
        const { audioStream } = tts.toStream(escapeSsml(chunk));
        const parts: Buffer[] = [];
        for await (const data of audioStream) parts.push(data as Buffer);
        return Buffer.concat(parts);
      })
    );
    return Buffer.concat(buffers);
  } finally {
    tts.close();
  }
}

// This is a free, unofficial consumer endpoint (not a documented API with
// an SLA) — a short burst of requests can get a transient 429 that clears
// within seconds. One retry with a short backoff absorbs that without
// surfacing an error to the reader for something that fixes itself.
async function synthesize(text: string, voice: string): Promise<Buffer> {
  try {
    return await synthesizeOnce(text, voice);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("429")) throw err;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return synthesizeOnce(text, voice);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, locale } = body as { text?: unknown; locale?: unknown };

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Texto vazio." }, { status: 400 });
    }
    if (text.length > MAX_CHARS) {
      return NextResponse.json({ error: "Texto muito longo." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "tts", { maxAttempts: 40, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const voice = VOICE_BY_LOCALE[locale === "en" ? "en" : "pt"];
    // Content-addressed by voice+text, so an edited article's audio
    // regenerates automatically and every reader of the same article shares
    // one cached file instead of re-synthesizing per visitor.
    const hash = crypto.createHash("sha256").update(`${voice}:${text}`).digest("hex").slice(0, 32);
    const path = `tts/${hash}.mp3`;

    const admin = await createAdminClient();
    const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = publicUrlData.publicUrl;

    const head = await fetch(publicUrl, { method: "HEAD" }).catch(() => null);
    if (head?.ok) {
      return NextResponse.json({ url: publicUrl });
    }

    const audioBuffer = await synthesize(text, voice);

    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, audioBuffer, {
      contentType: "audio/mpeg",
      cacheControl: "31536000",
      upsert: true,
    });
    if (uploadError) throw uploadError;

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("TTS synthesis error:", err);
    return NextResponse.json({ error: "Falha ao gerar áudio." }, { status: 500 });
  }
}
