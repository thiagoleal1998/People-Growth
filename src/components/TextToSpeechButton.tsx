"use client";

import { useEffect, useState } from "react";
import { Play, Square } from "lucide-react";

/** Uses the browser's built-in speech synthesis — no external service, no
 * cost, works offline. Support is present in every modern browser; on the
 * rare one without it, the click handler is just a no-op. Always rendering
 * (rather than feature-detecting and conditionally hiding) avoids a
 * server/client markup mismatch, since `window` doesn't exist during SSR. */
export function TextToSpeechButton({ text, title }: { text: string; title: string }) {
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
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.625rem 1.125rem",
        borderRadius: "9999px",
        border: "1px solid var(--site-border-strong)",
        backgroundColor: speaking ? "#4361EE" : "var(--site-surface)",
        color: speaking ? "white" : "var(--site-text)",
        fontSize: "0.875rem",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {speaking ? <Square size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
      {speaking ? "Parar" : "Ouvir"}
    </button>
  );
}
