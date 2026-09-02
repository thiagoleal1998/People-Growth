"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function NewsletterForm({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — real users never fill this
  const [renderedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "rate-limited">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, renderedAt }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else if (res.status === 429) {
        setStatus("rate-limited");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        style={{
          backgroundColor: compact ? "rgba(6,214,160,0.15)" : "rgba(6,214,160,0.1)",
          border: "1px solid rgba(6,214,160,0.3)",
          borderRadius: "0.75rem",
          padding: "0.875rem 1.25rem",
          color: "#06D6A0",
          fontWeight: 600,
          fontSize: "0.9rem",
          textAlign: "center",
        }}
      >
        ✓ Inscrição confirmada! Bem-vindo(a).
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot — hidden from real users, bots tend to fill every field */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
      />
      <div
        style={{
          display: "flex",
          gap: compact ? "0.5rem" : "0.75rem",
          flexDirection: compact ? "column" : "row",
          flexWrap: "wrap",
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu melhor e-mail"
          required
          style={{
            flex: 1,
            minWidth: 0,
            padding: compact ? "0.625rem 0.875rem" : "0.875rem 1.25rem",
            borderRadius: "0.625rem",
            border: light ? "1px solid var(--site-border-strong)" : "1px solid rgba(255,255,255,0.15)",
            backgroundColor: light ? "var(--site-card)" : compact ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.12)",
            color: light ? "var(--site-text)" : "white",
            fontSize: "0.9rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#06D6A0",
            color: "#0d1b2a",
            padding: compact ? "0.625rem 1.25rem" : "0.875rem 1.5rem",
            borderRadius: "0.625rem",
            fontWeight: 700,
            fontSize: "0.9rem",
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {status === "loading" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
          Assinar
        </button>
      </div>
      {status === "error" && (
        <p style={{ color: "#f87171", fontSize: "0.8125rem", marginTop: "0.5rem" }}>
          Algo deu errado. Tente novamente.
        </p>
      )}
      {status === "rate-limited" && (
        <p style={{ color: "#f87171", fontSize: "0.8125rem", marginTop: "0.5rem" }}>
          Muitas tentativas por aqui. Tente novamente mais tarde.
        </p>
      )}
    </form>
  );
}
