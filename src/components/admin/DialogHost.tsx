"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { registerDialogListener, type DialogRequest } from "./dialog-store";
import { fieldControlStyle } from "./ui";

/** Renders whatever confirmDialog()/promptDialog()/alertDialog() last asked
 * for — mount once near the root (admin/author layouts) so it's available
 * from any client component without prop drilling or per-page state. */
export function DialogHost() {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return registerDialogListener((req) => {
      setRequest(req);
      setValue(req.kind === "prompt" ? req.defaultValue : "");
    });
  }, []);

  useEffect(() => {
    if (request?.kind === "prompt") {
      // Focus after the modal has actually mounted.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [request]);

  if (!request) return null;

  function cancel() {
    if (!request) return;
    if (request.kind === "confirm") request.resolve(false);
    else if (request.kind === "prompt") request.resolve(null);
    else request.resolve();
    setRequest(null);
  }

  function confirmAction() {
    if (!request) return;
    if (request.kind === "confirm") request.resolve(true);
    else if (request.kind === "prompt") request.resolve(value);
    else request.resolve();
    setRequest(null);
  }

  const isPrompt = request.kind === "prompt";
  const isAlert = request.kind === "alert";
  const danger = request.kind === "confirm" && request.danger;

  return createPortal(
    <div
      onClick={cancel}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "0.875rem",
          padding: "1.5rem",
          width: "24rem",
          maxWidth: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        }}
      >
        <p style={{ color: "var(--admin-text)", fontSize: "0.9375rem", lineHeight: 1.5, margin: 0, whiteSpace: "pre-line" }}>
          {request.message}
        </p>
        {isPrompt && (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmAction();
              if (e.key === "Escape") cancel();
            }}
            style={{ ...fieldControlStyle, marginTop: "0.875rem" }}
          />
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.625rem", marginTop: "1.375rem" }}>
          {!isAlert && (
            <button
              type="button"
              onClick={cancel}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--admin-border-strong)",
                backgroundColor: "var(--admin-surface)",
                color: "var(--admin-text)",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={confirmAction}
            style={{
              padding: "0.5rem 1.125rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: danger ? "#dc2626" : "#4361EE",
              color: "white",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            {request.kind === "confirm" ? (request.confirmText ?? "Confirmar") : "OK"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
