"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export function ErrorReportButton() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function close() {
    setOpen(false);
    setStatus("idle");
    setDescription("");
    setEmail("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageUrl: window.location.href,
          description,
          email,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "white",
          backgroundColor: "#dc2626",
          padding: "0.375rem 0.75rem",
          borderRadius: "0.375rem",
          border: "none",
          cursor: "pointer",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        Comunicar erro
      </button>

      {open && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(13,27,42,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--site-card)",
              borderRadius: "1rem",
              padding: "1.75rem",
              maxWidth: "440px",
              width: "100%",
              position: "relative",
              color: "var(--site-text)",
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--site-faint)" }}
            >
              <X size={20} />
            </button>

            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
                <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Obrigado pelo aviso!</h3>
                <p style={{ color: "var(--site-muted)", fontSize: "0.9rem" }}>
                  Vamos analisar o erro reportado o quanto antes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.25rem" }}>Comunicar erro</h3>
                <p style={{ color: "var(--site-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                  Encontrou algo quebrado ou incorreto no site? Conte pra gente.
                </p>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                    O que aconteceu? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o erro que você encontrou..."
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid var(--site-border-strong)", fontSize: "0.9rem", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", backgroundColor: "var(--site-card)", color: "var(--site-text)" }}
                  />
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                    Seu e-mail (opcional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Para te avisarmos quando corrigirmos"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid var(--site-border-strong)", fontSize: "0.9rem", boxSizing: "border-box", backgroundColor: "var(--site-card)", color: "var(--site-text)" }}
                  />
                </div>

                {status === "error" && (
                  <p style={{ color: "#ef4444", fontSize: "0.8125rem", marginBottom: "1rem" }}>
                    Algo deu errado. Tente novamente.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    width: "100%",
                    backgroundColor: "#dc2626",
                    color: "white",
                    padding: "0.875rem",
                    borderRadius: "0.75rem",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    border: "none",
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                    opacity: status === "loading" ? 0.8 : 1,
                  }}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                      Enviando...
                    </>
                  ) : (
                    "Enviar"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
