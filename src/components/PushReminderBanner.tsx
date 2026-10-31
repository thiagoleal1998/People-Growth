"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { usePushSubscription } from "@/lib/use-push-subscription";

const DISMISS_KEY = "push-reminder-dismissed-at";
// Not a permanent dismissal (that would defeat "insistir") — sessionStorage
// clears when the tab/browser closes, so the banner is back next time the
// person opens the panel, without nagging on every click within today's
// work session once they've already said "not now" once.
function dismissedThisSession(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

// Mounted at the top of both the admin and author dashboard layouts —
// unlike the quiet toggle in NotificationBell's dropdown (PushOptIn.tsx),
// this one is meant to be hard to miss until the person opts in (or out,
// for this session) on this particular browser/device. It never blocks
// the rest of the panel — see the "Só insistir, sem bloquear" decision.
export function PushReminderBanner() {
  const { support, subscribed, busy, error, enable } = usePushSubscription();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // sessionStorage only exists client-side; this is a "use client"
    // component Next.js also server-renders, so the check has to happen in
    // an effect. The await just pushes the setState call past a microtask
    // boundary instead of calling it synchronously as the effect's first
    // statement (same reasoning as usePushSubscription's own detect()).
    Promise.resolve().then(() => setDismissed(dismissedThisSession()));
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // storage unavailable (private mode, blocked) — the dismiss still
      // works for this render, it just won't stick across a reload
    }
  }

  if (dismissed || subscribed) return null;
  if (support !== "ready" && support !== "ios-needs-install") return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        flexWrap: "wrap",
        padding: "0.875rem 1.125rem",
        marginBottom: "1.25rem",
        borderRadius: "0.75rem",
        backgroundColor: "#315E9C",
        color: "white",
      }}
    >
      <BellRing size={18} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: "16rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>Ative as notificações deste navegador</div>
        <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.8)", marginTop: "0.125rem" }}>
          {support === "ios-needs-install"
            ? "No iPhone, adicione este site à Tela de Início (compartilhar → Adicionar à Tela de Início) e abra por esse ícone para poder ativar."
            : "Para saber na hora quando uma matéria for publicada, aprovada ou precisar de ajuste — mesmo com o painel fechado."}
        </div>
        {error && <div style={{ fontSize: "0.75rem", color: "#ffd9d9", marginTop: "0.25rem" }}>{error}</div>}
      </div>
      {support === "ready" && (
        <button
          type="button"
          disabled={busy}
          onClick={enable}
          style={{
            flexShrink: 0,
            backgroundColor: "white",
            color: "#315E9C",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            fontSize: "0.8125rem",
            fontWeight: 700,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? "Ativando..." : "Ativar agora"}
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        style={{ flexShrink: 0, background: "none", border: "none", color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
      >
        Agora não
      </button>
    </div>
  );
}
