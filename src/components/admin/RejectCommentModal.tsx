"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function RejectCommentModal({
  commenterName,
  pending,
  onCancel,
  onConfirm,
}: {
  commenterName: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(13,27,42,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--admin-surface)",
          borderRadius: "1rem",
          padding: "1.75rem",
          maxWidth: "440px",
          width: "100%",
          position: "relative",
          color: "var(--admin-text)",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Fechar"
          style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--admin-faint)" }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.25rem" }}>Rejeitar comentário</h3>
        <p style={{ color: "var(--admin-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Comentário de {commenterName}. O motivo fica só na moderação — não aparece pro público.
        </p>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
            Motivo (opcional)
          </label>
          <textarea
            autoFocus
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: linguagem ofensiva, spam, fora do tema..."
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.625rem",
              border: "1px solid var(--admin-border-strong)",
              fontSize: "0.9rem",
              boxSizing: "border-box",
              resize: "vertical",
              fontFamily: "inherit",
              backgroundColor: "var(--admin-surface)",
              color: "var(--admin-text)",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            style={{
              padding: "0.625rem 1.125rem",
              borderRadius: "0.625rem",
              border: "1px solid var(--admin-border-strong)",
              backgroundColor: "transparent",
              color: "var(--admin-text)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: pending ? "default" : "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={pending}
            style={{
              padding: "0.625rem 1.125rem",
              borderRadius: "0.625rem",
              border: "none",
              backgroundColor: "#dc2626",
              color: "white",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: pending ? "default" : "pointer",
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? "Rejeitando..." : "Rejeitar comentário"}
          </button>
        </div>
      </div>
    </div>
  );
}
