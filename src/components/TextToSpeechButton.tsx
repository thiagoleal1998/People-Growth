"use client";

import { useEffect, useRef, useState } from "react";
import { CirclePlay, CirclePause, Loader2, RotateCcw, RotateCw } from "lucide-react";
import { buildWordSpans, alignWords, findActiveWord, type AlignedWord, type WordTiming } from "@/lib/speech-sync";

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
const SKIP_SECONDS = 10;

// /api/tts can take a while on a long article (or if the free Edge TTS
// service needed a few retries, see that route) — a single static
// "Carregando áudio…" starts reading as stuck past a few seconds. Cycling
// through these keeps it clearly alive without promising a specific time.
const LOADING_MESSAGES = [
  "Carregando áudio…",
  "Preparando a narração…",
  "Ainda carregando…",
  "Pode levar alguns segundos…",
  "Quase lá…",
];
const LOADING_MESSAGE_INTERVAL_MS = 4000;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Status = "idle" | "loading" | "ready" | "error";

/** Narration comes from /api/tts (Edge TTS neural voices, proxied and
 * cached server-side — see that route) instead of the browser's own
 * speechSynthesis: far more natural-sounding, and consistent across every
 * visitor's device instead of depending on whatever voices happen to be
 * installed locally. */
export function TextToSpeechButton({
  text,
  title,
  locale,
  fill,
  highlightRef,
}: {
  text: string;
  title: string;
  locale?: string;
  fill?: boolean;
  /** The rendered article body to highlight word-by-word as it's read, if
   * the server returned word timings for this narration (see /api/tts). */
  highlightRef?: React.RefObject<HTMLElement | null>;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Not state — this drives a per-frame rAF loop, so it must never trigger
  // a re-render on its own.
  const alignedWordsRef = useRef<AlignedWord[] | null>(null);
  const activeWordRef = useRef<HTMLElement | null>(null);
  // Set on any real user scroll gesture (wheel/touch), not on the
  // programmatic scrollTo below — the auto-follow skips its next move for a
  // few seconds after one of these, so scrolling up to re-read something (or
  // to reach this button) doesn't get immediately undone by the next word.
  const lastManualScrollRef = useRef(0);

  function clearActiveWord() {
    activeWordRef.current?.classList.remove("tts-active-word");
    activeWordRef.current = null;
  }

  useEffect(() => {
    function markManualScroll() {
      lastManualScrollRef.current = Date.now();
    }
    window.addEventListener("wheel", markManualScroll, { passive: true });
    window.addEventListener("touchmove", markManualScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", markManualScroll);
      window.removeEventListener("touchmove", markManualScroll);
    };
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      clearActiveWord();
    };
  }, []);

  // Highlights the word currently being spoken while playing. Separate from
  // the `ontimeupdate`-driven currentTime state above — that fires too
  // coarsely/irregularly for a per-word highlight to look smooth.
  useEffect(() => {
    if (!playing) return;
    let frameId: number;
    function tick() {
      const audio = audioRef.current;
      const aligned = alignedWordsRef.current;
      if (audio && aligned) {
        const active = findActiveWord(aligned, audio.currentTime * 1000);
        if ((active?.span ?? null) !== activeWordRef.current) {
          activeWordRef.current?.classList.remove("tts-active-word");
          active?.span.classList.add("tts-active-word");
          activeWordRef.current = active?.span ?? null;
          // The page follows the reading along, instead of leaving the
          // reader to notice it drifted off the bottom of the screen and
          // scroll by hand to catch up — triggers once the word nears the
          // edge of the viewport (about to leave it), not only once it's
          // already gone, and the same check catches a skip-back landing
          // above the top edge too.
          const scrolledManuallyRecently = Date.now() - lastManualScrollRef.current < 3000;
          if (active?.span && !scrolledManuallyRecently) {
            const rect = active.span.getBoundingClientRect();
            const viewportH = window.innerHeight;
            if (rect.bottom > viewportH * 0.8 || rect.top < viewportH * 0.15) {
              window.scrollTo({ top: window.scrollY + rect.top - viewportH * 0.35, behavior: "smooth" });
            }
          }
        }
      }
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [playing]);

  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, LOADING_MESSAGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status]);

  async function ensureAudio(): Promise<HTMLAudioElement | null> {
    if (audioRef.current) return audioRef.current;
    setStatus("loading");
    setLoadingMessageIndex(0);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${title}. ${text}`, locale: locale ?? "pt" }),
      });
      if (!res.ok) throw new Error("tts request failed");
      const data = (await res.json()) as { url?: string; timingsUrl?: string | null };
      if (!data.url) throw new Error("tts response missing url");

      // Word timings are a bonus layer — fetched best-effort, never block
      // (or fail) playback over them. Missing for narrations cached before
      // this feature shipped, or if the fetch itself fails.
      if (data.timingsUrl && highlightRef?.current) {
        try {
          const timingsRes = await fetch(data.timingsUrl);
          if (timingsRes.ok) {
            const timings = (await timingsRes.json()) as WordTiming[];
            // The synthesized text is "{title}. {text}" — drop the title's
            // own words so word 0 of the alignment lines up with the first
            // word actually rendered inside highlightRef. alignWords()'s
            // lookahead matching tolerates this count being approximate.
            const titleWordCount = title.trim().split(/\s+/).filter(Boolean).length;
            const spans = buildWordSpans(highlightRef.current);
            alignedWordsRef.current = alignWords(timings.slice(titleWordCount), spans);
          }
        } catch {
          alignedWordsRef.current = null;
        }
      }

      const audio = new Audio(data.url);
      audio.playbackRate = SPEEDS[speedIndex];
      audio.onplay = () => setPlaying(true);
      audio.onpause = () => setPlaying(false);
      audio.onended = () => {
        setPlaying(false);
        clearActiveWord();
      };
      audio.onwaiting = () => setBuffering(true);
      audio.onplaying = () => setBuffering(false);
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audioRef.current = audio;
      setStatus("ready");
      return audio;
    } catch {
      setStatus("error");
      return null;
    }
  }

  async function togglePlay() {
    const audio = await ensureAudio();
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setStatus("error"));
    } else {
      audio.pause();
    }
  }

  function skip(delta: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), audio.duration);
  }

  function cycleSpeed() {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  }

  function seekToFraction(fraction: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = fraction * audio.duration;
  }

  const iconButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.875rem",
    height: "1.875rem",
    flexShrink: 0,
    border: "none",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    padding: 0,
  };

  // Before the first "play" click (or while that click is still fetching
  // the audio), this is a single compact button — matches the old
  // behavior, and avoids committing layout space to transport controls for
  // a reader who may never press play.
  if (status === "idle" || status === "loading" || status === "error") {
    return (
      <button
        type="button"
        onClick={togglePlay}
        disabled={status === "loading"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          padding: "0.75rem 1.125rem",
          borderRadius: "0.625rem",
          border: status === "error" ? "1px solid #dc6b6b" : "1px solid var(--site-border-strong)",
          backgroundColor: status === "loading" ? "#315E9C" : status === "error" ? "rgba(220,107,107,0.1)" : "var(--site-surface-alt)",
          color: status === "loading" ? "white" : status === "error" ? "#c23b3b" : "var(--site-text)",
          fontSize: "0.9375rem",
          fontWeight: 700,
          cursor: status === "loading" ? "default" : "pointer",
          flex: fill ? 1 : undefined,
        }}
      >
        {status === "loading" ? <Loader2 size={20} className="tts-spin" /> : <CirclePlay size={20} />}
        {status === "loading" ? LOADING_MESSAGES[loadingMessageIndex] : status === "error" ? "Tentar de novo" : "Ouvir"}
        <style>{`.tts-spin { animation: tts-spin 0.9s linear infinite; } @keyframes tts-spin { to { transform: rotate(360deg); } }`}</style>
      </button>
    );
  }

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <>
    {/* Floating play/pause, fixed to the viewport — the auto-scroll above
        keeps the page roughly in sync with the reading, but the reader
        still shouldn't *have* to scroll back up to the original button
        (which may now be off-screen) just to pause. Bottom-left, so it
        doesn't collide with the WhatsApp channel button fixed bottom-right. */}
    <button
      type="button"
      onClick={togglePlay}
      title={playing ? "Pausar leitura" : "Retomar leitura"}
      style={{
        position: "fixed",
        left: "1.25rem",
        bottom: "5.5rem",
        zIndex: 45,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "3.25rem",
        height: "3.25rem",
        borderRadius: "50%",
        border: "none",
        backgroundColor: "#315E9C",
        color: "white",
        boxShadow: "0 6px 20px -4px rgba(49,94,156,0.55)",
        cursor: "pointer",
      }}
    >
      {buffering ? <Loader2 size={24} className="tts-spin" /> : playing ? <CirclePause size={26} /> : <CirclePlay size={26} />}
    </button>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0.875rem",
        borderRadius: "0.625rem",
        border: "1px solid var(--site-border-strong)",
        backgroundColor: playing ? "#315E9C" : "var(--site-surface-alt)",
        color: playing ? "white" : "var(--site-text)",
        flex: fill ? 1 : undefined,
        minWidth: 0,
      }}
    >
      <button type="button" onClick={() => skip(-SKIP_SECONDS)} title="Voltar 10s" style={iconButtonStyle}>
        <RotateCcw size={16} />
      </button>

      <button type="button" onClick={togglePlay} title={playing ? "Pausar" : "Tocar"} style={iconButtonStyle}>
        {buffering ? <Loader2 size={20} className="tts-spin" /> : playing ? <CirclePause size={20} /> : <CirclePlay size={20} />}
      </button>

      <button type="button" onClick={() => skip(SKIP_SECONDS)} title="Avançar 10s" style={iconButtonStyle}>
        <RotateCw size={16} />
      </button>

      <div style={{ flex: 1, minWidth: "4rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seekToFraction(Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1));
          }}
          style={{
            position: "relative",
            height: "0.25rem",
            borderRadius: "9999px",
            backgroundColor: playing ? "rgba(255,255,255,0.3)" : "var(--site-border)",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0 auto 0 0",
              width: `${progress * 100}%`,
              borderRadius: "9999px",
              backgroundColor: "currentColor",
            }}
          />
        </div>
        <span style={{ fontSize: "0.6875rem", fontWeight: 600, opacity: 0.8 }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <button
        type="button"
        onClick={cycleSpeed}
        title="Velocidade da leitura"
        style={{
          flexShrink: 0,
          fontSize: "0.75rem",
          fontWeight: 700,
          color: playing ? "rgba(255,255,255,0.9)" : "var(--site-muted)",
          backgroundColor: playing ? "rgba(255,255,255,0.15)" : "var(--site-border)",
          border: "none",
          padding: "0.1875rem 0.5rem",
          borderRadius: "9999px",
          cursor: "pointer",
        }}
      >
        {SPEEDS[speedIndex]}x
      </button>

      <style>{`.tts-spin { animation: tts-spin 0.9s linear infinite; } @keyframes tts-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
    </>
  );
}
