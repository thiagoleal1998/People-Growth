"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export function ResourceDownloadButton({
  resourceId,
  leadRequired,
  downloadCount,
  color,
  label,
}: {
  resourceId: string;
  leadRequired: boolean;
  downloadCount: number;
  color: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [renderedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "rate-limited">("idle");

  const buttonColor = color === "#FFB703" ? "#0d1b2a" : "white";
  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--site-border-strong)",
    fontSize: "0.8125rem",
    color: "var(--site-text)",
    backgroundColor: "var(--site-card)",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  async function doDownload(extra?: { name: string; email: string }) {
    setStatus("loading");
    try {
      const res = await fetch(`/api/resources/${resourceId}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...extra, website, renderedAt }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        setStatus("idle");
        setOpen(false);
      } else if (res.status === 429) {
        setStatus("rate-limited");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doDownload({ name, email });
  }

  return (
    <div style={{ borderTop: "1px solid var(--site-border-strong)", paddingTop: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)", fontWeight: 500 }}>{downloadCount.toLocaleString("pt-BR")} downloads</span>
        {!open && (
          <button
            type="button"
            onClick={() => (leadRequired ? setOpen(true) : doDownload())}
            disabled={status === "loading"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              backgroundColor: color,
              color: buttonColor,
              padding: "0.5rem 1rem",
              borderRadius: "0.625rem",
              fontWeight: 700,
              fontSize: "0.875rem",
              border: "none",
              cursor: status === "loading" ? "default" : "pointer",
              opacity: status === "loading" ? 0.7 : 1,
            }}
          >
            {status === "loading" ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={14} />}
            {label}
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
          <p style={{ fontSize: "0.75rem", color: "var(--site-muted)" }}>Informe seu e-mail para baixar este recurso.</p>
          <input type="text" required placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          <input type="email" required placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          {status === "error" && <p style={{ color: "#ef4444", fontSize: "0.75rem" }}>Algo deu errado. Tente novamente.</p>}
          {status === "rate-limited" && <p style={{ color: "#ef4444", fontSize: "0.75rem" }}>Muitas tentativas. Tente mais tarde.</p>}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem",
                backgroundColor: color,
                color: buttonColor,
                padding: "0.5rem",
                borderRadius: "0.625rem",
                fontWeight: 700,
                fontSize: "0.8125rem",
                border: "none",
                cursor: status === "loading" ? "default" : "pointer",
              }}
            >
              {status === "loading" ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={14} />}
              Baixar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ padding: "0.5rem 0.75rem", background: "none", border: "none", color: "var(--site-muted)", fontSize: "0.8125rem", cursor: "pointer" }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
