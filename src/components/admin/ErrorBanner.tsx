"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function ErrorBanner({ message }: { message?: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [captured] = useState(message);

  if (!captured || dismissed) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "0.75rem",
        backgroundColor: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "#b91c1c",
        borderRadius: "0.5rem",
        padding: "0.625rem 0.875rem",
        fontSize: "0.8125rem",
        marginTop: "0.5rem",
      }}
    >
      <span>Não foi possível enviar a imagem: {captured}</span>
      <button
        onClick={() => setDismissed(true)}
        style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", flexShrink: 0, padding: 0 }}
        aria-label="Fechar"
      >
        <X size={14} />
      </button>
    </div>
  );
}
