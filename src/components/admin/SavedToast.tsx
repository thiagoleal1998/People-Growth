"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

const DURATION_MS = 5000;

export function SavedToast({ show }: { show: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  // Lets the "x" button hide the toast immediately, ahead of the auto-
  // dismiss timer below (which still fires and clears the URL regardless —
  // harmless, since a second router.replace to the same path is a no-op).
  const [dismissed, setDismissed] = useState(false);
  const [prevShow, setPrevShow] = useState(show);

  // Reset a previous manual dismissal whenever a new "show" turns on.
  // Adjusted during render (React's recommended pattern for state that
  // depends on a prop change) rather than in the effect below, which
  // would otherwise call setState synchronously on every mount.
  if (show !== prevShow) {
    setPrevShow(show);
    if (show) setDismissed(false);
  }

  // The toast's visibility is just `show` directly — no separate local
  // state to keep in sync with it. The previous version stripped "?saved=1"
  // from the URL immediately, which flipped `show` back to false well
  // before the auto-dismiss mark; a cleanup tied to that dependency change ended up
  // cancelling the still-pending dismiss timer before it ever fired, so the
  // toast never actually disappeared. Deferring the URL cleanup until AFTER
  // the delay — rather than tracking visibility as its own state — means
  // there's no premature transition for a cleanup to race against.
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => router.replace(pathname, { scroll: false }), DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const visible = show && !dismissed;

  if (!visible) return null;

  const close = () => {
    setDismissed(true);
    router.replace(pathname, { scroll: false });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "1.25rem",
        right: "1.25rem",
        zIndex: 200,
        backgroundColor: "#04a87d",
        color: "white",
        borderRadius: "0.625rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        overflow: "hidden",
        minWidth: "230px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem" }}>
        <CheckCircle2 size={18} />
        <span style={{ flex: 1, fontWeight: 600, fontSize: "0.875rem" }}>Salvo com sucesso</span>
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          style={{ display: "flex", background: "none", border: "none", padding: "0.125rem", marginLeft: "0.25rem", color: "rgba(255,255,255,0.85)", cursor: "pointer" }}
        >
          <X size={16} />
        </button>
      </div>
      {/* Remounts (and so restarts its shrink animation) every time the toast
          reappears, since the whole component returns null while hidden. */}
      <div style={{ height: "3px", backgroundColor: "rgba(255,255,255,0.3)" }}>
        <div style={{ height: "100%", backgroundColor: "white", animation: `saved-toast-shrink ${DURATION_MS}ms linear forwards` }} />
      </div>
      <style>{`
        @keyframes saved-toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
