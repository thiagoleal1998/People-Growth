"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function CommentForm({
  articleId,
  parentId,
  compact = false,
  onCancel,
}: {
  articleId: string;
  parentId?: string;
  compact?: boolean;
  onCancel?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [renderedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "rate-limited">("idle");

  const inputStyle = {
    width: "100%",
    padding: compact ? "0.625rem 0.875rem" : "0.75rem 1rem",
    borderRadius: "0.625rem",
    border: "1px solid var(--site-border-strong)",
    fontSize: compact ? "0.875rem" : "0.9rem",
    color: "var(--site-text)",
    outline: "none",
    backgroundColor: "var(--site-card)",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, parentId, name, email, comment, website, renderedAt }),
      });
      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setComment("");
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
      <div style={{ backgroundColor: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.3)", borderRadius: "0.75rem", padding: compact ? "1rem" : "1.25rem", textAlign: "center" }}>
        <p style={{ color: "var(--site-text)", fontWeight: 600, fontSize: compact ? "0.875rem" : "0.9375rem" }}>
          {parentId ? "Resposta enviada!" : "Comentário enviado!"} Ela aparece aqui assim que for aprovada.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Honeypot — hidden from real users */}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          style={inputStyle}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail (não é publicado)"
          style={inputStyle}
        />
      </div>
      <textarea
        required
        rows={compact ? 3 : 4}
        maxLength={3000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={parentId ? "Escreva sua resposta..." : "Deixe seu comentário..."}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      {status === "error" && (
        <p style={{ color: "#ef4444", fontSize: "0.8125rem" }}>Algo deu errado. Tente novamente.</p>
      )}
      {status === "rate-limited" && (
        <p style={{ color: "#ef4444", fontSize: "0.8125rem" }}>Muitas tentativas por aqui. Tente novamente mais tarde.</p>
      )}

      <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            alignSelf: "flex-start",
            backgroundColor: "#4361EE",
            color: "white",
            padding: compact ? "0.625rem 1.25rem" : "0.75rem 1.5rem",
            borderRadius: "0.625rem",
            fontWeight: 700,
            fontSize: compact ? "0.8125rem" : "0.875rem",
            border: "none",
            cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: status === "loading" ? 0.8 : 1,
          }}
        >
          {status === "loading" ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Enviando...
            </>
          ) : parentId ? (
            "Responder"
          ) : (
            "Comentar"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ background: "none", border: "none", color: "var(--site-muted)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
