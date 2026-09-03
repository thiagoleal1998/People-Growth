"use client";

import { useEffect, useState } from "react";
import { CirclePlay, CircleStop } from "lucide-react";

/** Uses the browser's built-in speech synthesis — no external service, no
 * cost, works offline. Support is present in every modern browser; on the
 * rare one without it, the click handler is just a no-op. Always rendering
 * (rather than feature-detecting and conditionally hiding) avoids a
 * server/client markup mismatch, since `window` doesn't exist during SSR. */
export function TextToSpeechButton({ text, title, fill }: { text: string; title: string; fill?: boolean }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function toggle() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(`${title}. ${text}`);
    utterance.lang = "pt-BR";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.75rem 1.125rem",
        borderRadius: "0.625rem",
        border: "1px solid var(--site-border-strong)",
        backgroundColor: speaking ? "#4361EE" : "var(--site-surface-alt)",
        color: speaking ? "white" : "var(--site-text)",
        fontSize: "0.9375rem",
        fontWeight: 700,
        cursor: "pointer",
        flex: fill ? 1 : undefined,
      }}
    >
      {speaking ? <CircleStop size={20} /> : <CirclePlay size={20} />}
      {speaking ? "Parar" : "Ouvir"}
      <span
        style={{
          marginLeft: "auto",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: speaking ? "rgba(255,255,255,0.8)" : "var(--site-muted)",
          backgroundColor: speaking ? "rgba(255,255,255,0.15)" : "var(--site-border)",
          padding: "0.1875rem 0.5rem",
          borderRadius: "9999px",
        }}
      >
        1x
      </span>
    </button>
  );
}
