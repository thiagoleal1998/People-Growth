"use client";

import { useEffect, useRef, useState } from "react";
import { CirclePlay, CirclePause, Loader2, RotateCcw, RotateCw } from "lucide-react";

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
const SKIP_SECONDS = 10;

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
export function TextToSpeechButton({ text, title, locale, fill }: { text: string; title: string; locale?: string; fill?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  async function ensureAudio(): Promise<HTMLAudioElement | null> {
    if (audioRef.current) return audioRef.current;
    setStatus("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${title}. ${text}`, locale: locale ?? "pt" }),
      });
      if (!res.ok) throw new Error("tts request failed");
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("tts response missing url");

      const audio = new Audio(data.url);
      audio.playbackRate = SPEEDS[speedIndex];
      audio.onplay = () => setPlaying(true);
      audio.onpause = () => setPlaying(false);
      audio.onended = () => setPlaying(false);
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
        {status === "loading" ? "Carregando áudio…" : status === "error" ? "Tentar de novo" : "Ouvir"}
        <style>{`.tts-spin { animation: tts-spin 0.9s linear infinite; } @keyframes tts-spin { to { transform: rotate(360deg); } }`}</style>
      </button>
    );
  }

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
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
  );
}
