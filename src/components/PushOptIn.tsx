"use client";

import { BellRing, BellOff } from "lucide-react";
import { usePushSubscription } from "@/lib/use-push-subscription";

// Mounted in NotificationBell's dropdown footer — the one place both the
// admin and columnist sidebars pick it up for free, same as NotificationBell
// itself. The more insistent top-of-page nudge is PushReminderBanner.tsx;
// this is the quiet, always-available toggle for turning it back off.
export function PushOptIn() {
  const { support, subscribed, subscriptionChecked, busy, error, enable, disable } = usePushSubscription();

  if (support === "checking" || support === "unsupported") return null;
  // support flips to "ready" before the actual subscription lookup
  // finishes — waiting here avoids flashing "Ativar" for someone who's
  // already subscribed (see the comment on subscriptionChecked itself).
  if (support === "ready" && !subscriptionChecked) return null;

  const wrapperStyle: React.CSSProperties = { padding: "0.625rem 1rem", borderTop: "1px solid var(--admin-border)" };

  if (support === "ios-needs-install") {
    return (
      <div style={wrapperStyle}>
        <p style={{ fontSize: "0.6875rem", color: "var(--admin-faint)", lineHeight: 1.4, margin: 0 }}>
          No iPhone, para receber notificações é preciso primeiro adicionar este site à Tela de Início (compartilhar → Adicionar à Tela de Início) e abrir por esse ícone.
        </p>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <button
        type="button"
        disabled={busy}
        onClick={subscribed ? disable : enable}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          fontSize: "0.75rem",
          fontWeight: 600,
          color: subscribed ? "var(--admin-muted)" : "#315E9C",
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {subscribed ? <BellOff size={14} /> : <BellRing size={14} />}
        {busy ? "Aguarde..." : subscribed ? "Desativar notificações neste navegador" : "Ativar notificações neste navegador"}
      </button>
      {error && <div style={{ fontSize: "0.6875rem", color: "#dc2626", marginTop: "0.25rem" }}>{error}</div>}
    </div>
  );
}
