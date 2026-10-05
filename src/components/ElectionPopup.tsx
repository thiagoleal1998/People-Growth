"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { ElectionTag } from "@/components/ElectionTag";

export type PopupPerson = { name: string; party: string; color: string; photo: string | null; tag: "elected" | "runoff" };

// Shown when someone in the race is elected or headed to a runoff. Once closed, it
// stays closed for the rest of the browser session (sessionStorage, best effort).
function wasClosed(storageKey: string): boolean {
  try {
    return sessionStorage.getItem(storageKey) === "closed";
  } catch {
    return false;
  }
}

// Hidden on the server, so the page renders the same first; the browser then reads
// the session and opens the pop-up if it has not been closed in this session.
const noSubscribe = () => () => {};

export function ElectionPopup({ storageKey, title, subtitle, people }: { storageKey: string; title: string; subtitle: string; people: PopupPerson[] }) {
  const [closedNow, setClosedNow] = useState(false);
  const closedBefore = useSyncExternalStore(
    noSubscribe,
    () => wasClosed(storageKey),
    () => true
  );
  const open = !closedBefore && !closedNow;

  const close = useCallback(() => {
    try {
      sessionStorage.setItem(storageKey, "closed");
    } catch {
      // Storage can be blocked; the popup then simply reappears on reload.
    }
    setClosedNow(true);
  }, [storageKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, zIndex: 1000, backgroundColor: "rgba(13,27,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="election-popup-title"
        onClick={(event) => event.stopPropagation()}
        style={{ width: "100%", maxWidth: "420px", borderRadius: "0.875rem", backgroundColor: "var(--site-card)", border: "1px solid var(--site-border-strong)", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", padding: "1.25rem 1.375rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <div id="election-popup-title" style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--site-text)" }}>{title}</div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#4361EE", marginTop: "0.125rem" }}>{subtitle}</div>
          </div>
          <button type="button" onClick={close} aria-label="Fechar" style={{ border: "none", background: "transparent", color: "var(--site-muted)", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer", padding: "0 0.25rem" }}>
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {people.map((person, index) => (
            <div key={`${person.name}-${index}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "3.25rem", height: "3.25rem", borderRadius: "0.5rem", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--site-surface-alt)", boxShadow: `0 0 0 2px ${person.color}` }}>
                {person.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={person.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)" }}>{person.name}</span>
                  <ElectionTag kind={person.tag} color={person.color} />
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: person.color, marginTop: "0.125rem" }}>{person.party}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
