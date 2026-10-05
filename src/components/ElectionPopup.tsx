"use client";

import { useState, useSyncExternalStore } from "react";
import { ElectionTag } from "@/components/ElectionTag";

export type PopupPerson = { name: string; party: string; color: string; photo: string | null; tag: "elected" | "runoff" };

function wasClosed(storageKey: string): boolean {
  try {
    return sessionStorage.getItem(storageKey) === "closed";
  } catch {
    return false;
  }
}

// Hidden on the server, so the page renders the same first; the browser then reads
// the session and shows the banner if it was not closed in this session.
const noSubscribe = () => () => {};

// A banner that slides down from the top of the screen. It does not cover the page or
// take focus, so the results stay usable underneath. Once closed it stays closed for
// the rest of the browser session (sessionStorage, best effort).
export function ElectionPopup({ storageKey, title, subtitle, people }: { storageKey: string; title: string; subtitle: string; people: PopupPerson[] }) {
  const [closedNow, setClosedNow] = useState(false);
  const closedBefore = useSyncExternalStore(
    noSubscribe,
    () => wasClosed(storageKey),
    () => true
  );
  if (closedBefore || closedNow) return null;

  function close() {
    try {
      sessionStorage.setItem(storageKey, "closed");
    } catch {
      // Storage can be blocked; the banner then simply shows again on reload.
    }
    setClosedNow(true);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="election-popup"
      style={{
        position: "fixed",
        top: "5.5rem",
        left: "50%",
        zIndex: 900,
        width: "min(92vw, 380px)",
        borderRadius: "0.875rem",
        backgroundColor: "var(--site-card)",
        border: "1px solid var(--site-border-strong)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
        padding: "1rem 1.125rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--site-text)" }}>{title}</div>
          <div style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#4361EE", marginTop: "0.125rem" }}>{subtitle}</div>
        </div>
        <button type="button" onClick={close} aria-label="Fechar" style={{ border: "none", background: "transparent", color: "var(--site-muted)", fontSize: "1.375rem", lineHeight: 1, cursor: "pointer", padding: "0 0.25rem" }}>
          ×
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {people.map((person, index) => (
          <div key={`${person.name}-${index}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "3rem", height: "3rem", borderRadius: "0.5rem", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--site-surface-alt)", boxShadow: `0 0 0 2px ${person.color}` }}>
              {person.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={person.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)" }}>{person.name}</span>
                <ElectionTag kind={person.tag} />
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: person.color, marginTop: "0.125rem" }}>{person.party}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .election-popup { animation: election-popup-in 420ms ease-out both; transform: translateX(-50%); }
        @keyframes election-popup-in {
          from { opacity: 0; transform: translate(-50%, -1.5rem); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
