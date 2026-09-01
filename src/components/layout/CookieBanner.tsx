"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: "#0d1b2a",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "1rem 1.25rem",
      }}
    >
      <div
        className="container-xl"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8125rem", lineHeight: 1.6, margin: 0, maxWidth: "640px" }}>
          Usamos cookies essenciais para o funcionamento do site. Não usamos cookies de rastreamento ou publicidade.{" "}
          <Link href="/cookies" style={{ color: "#06D6A0", fontWeight: 600 }}>
            Saiba mais
          </Link>
        </p>
        <button
          onClick={accept}
          style={{
            backgroundColor: "#4361EE",
            color: "white",
            border: "none",
            padding: "0.625rem 1.5rem",
            borderRadius: "0.625rem",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
