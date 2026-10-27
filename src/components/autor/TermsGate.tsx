"use client";

import { useState, useTransition } from "react";
import { confirmDialog } from "@/components/admin/dialog-store";
import { acceptTerms, declineTerms } from "@/app/autor/(dashboard)/perfil/actions";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Blocks the whole author panel until the columnist answers — no backdrop
// dismiss, no close button, unlike every other dialog in this codebase
// (DialogHost's confirm/alert/prompt are all intentionally dismissible).
// Rendered from the dashboard layout itself, not local component state, so
// it can't be skipped by never mounting the component that would show it.
function AcceptanceModal({ title, bodyHtml, pending, onAccept, onDecline }: { title: string; bodyHtml: string; pending: boolean; onAccept: () => void; onDecline: () => void }) {
  return (
    // Below DialogHost's own zIndex: 1000 (src/components/admin/DialogHost.tsx)
    // — the "Não concordo" button below opens a confirmDialog() on top of
    // this modal, which needs to actually render above it to be clickable.
    <div style={{ position: "fixed", inset: 0, zIndex: 900, backgroundColor: "rgba(13,27,42,0.78)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.25rem" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--admin-surface)",
          borderRadius: "1rem",
          boxShadow: "0 24px 60px -16px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1.5rem 1.75rem 1.25rem", borderBottom: "1px solid var(--admin-border)" }}>
          <h2 style={{ fontSize: "1.1875rem", fontWeight: 800, color: "var(--admin-text)" }}>{title}</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginTop: "0.375rem" }}>
            Leia os termos abaixo antes de continuar — essa tela aparece até você responder.
          </p>
        </div>
        <div
          className="admin-scroll"
          style={{ padding: "1.5rem 1.75rem", overflowY: "auto", flex: 1, color: "var(--admin-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
        <div style={{ padding: "1.25rem 1.75rem", borderTop: "1px solid var(--admin-border)", display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onDecline}
            disabled={pending}
            style={{ padding: "0.625rem 1.125rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", backgroundColor: "transparent", color: "var(--admin-text-secondary)", fontWeight: 700, fontSize: "0.875rem", cursor: pending ? "default" : "pointer" }}
          >
            Não concordo
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={pending}
            style={{ padding: "0.625rem 1.25rem", borderRadius: "0.5rem", border: "none", backgroundColor: "#16A34A", color: "white", fontWeight: 800, fontSize: "0.875rem", cursor: pending ? "default" : "pointer", opacity: pending ? 0.7 : 1 }}
          >
            {pending ? "Enviando..." : "Li e concordo com os termos"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TermsGate({
  termsAcceptedAt,
  termsDeclinedAt,
  termsTitle,
  termsBodyHtml,
}: {
  termsAcceptedAt: string | null;
  termsDeclinedAt: string | null;
  termsTitle: string;
  termsBodyHtml: string;
}) {
  const [pending, startTransition] = useTransition();
  // Seeded from the server-rendered props and only overridden optimistically
  // right after this tab's own accept/decline click — revalidatePath() will
  // bring a fresh value on the next navigation/refresh regardless.
  const [localState, setLocalState] = useState<"accepted" | "declined" | "pending" | null>(null);
  const state = localState ?? (termsAcceptedAt ? "accepted" : termsDeclinedAt ? "declined" : "pending");

  function handleAccept() {
    startTransition(async () => {
      await acceptTerms();
      setLocalState("accepted");
    });
  }

  async function handleDecline() {
    const confirmed = await confirmDialog(
      "Tem certeza? Ao recusar, seu perfil fica oculto do site e você não consegue criar ou editar conteúdo até aceitar os termos. Você pode mudar de ideia e aceitar a qualquer momento.",
      { danger: true, confirmText: "Não concordo" }
    );
    if (!confirmed) return;
    startTransition(async () => {
      await declineTerms();
      setLocalState("declined");
    });
  }

  if (state === "pending") {
    return <AcceptanceModal title={termsTitle} bodyHtml={termsBodyHtml} pending={pending} onAccept={handleAccept} onDecline={handleDecline} />;
  }

  if (state === "declined") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          padding: "0.875rem 1.25rem",
          marginBottom: "1.25rem",
          borderRadius: "0.75rem",
          backgroundColor: "rgba(220,38,38,0.08)",
          border: "1px solid rgba(220,38,38,0.3)",
        }}
      >
        <div style={{ fontSize: "0.8125rem", color: "var(--admin-text-secondary)" }}>
          <strong style={{ color: "#dc2626" }}>Você recusou o Termo de Aceite</strong>
          {termsDeclinedAt && ` em ${formatDateTime(termsDeclinedAt)}`}. Seu perfil está oculto do site e você não consegue criar ou editar conteúdo até aceitar.
        </div>
        <button
          type="button"
          onClick={handleAccept}
          disabled={pending}
          style={{ flexShrink: 0, padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", backgroundColor: "#16A34A", color: "white", fontWeight: 700, fontSize: "0.8125rem", cursor: pending ? "default" : "pointer", opacity: pending ? 0.7 : 1 }}
        >
          {pending ? "Enviando..." : "Aceitar agora"}
        </button>
      </div>
    );
  }

  return null;
}
