"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "cookie-consent";

function hasAccepted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

// Hidden on the server, then shown in the browser until the notice is accepted.
const noSubscribe = () => () => {};

export function CookieBanner() {
  const t = useTranslations("common");
  const [acceptedNow, setAcceptedNow] = useState(false);
  const acceptedBefore = useSyncExternalStore(noSubscribe, hasAccepted, () => true);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setAcceptedNow(true);
  }

  if (acceptedBefore || acceptedNow) return null;

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
        padding: "0.75rem 1rem",
      }}
    >
      {/* On phones the notice and the button share a row, so the bar stays short. */}
      <div
        className="container-xl"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <p style={{ flex: "1 1 200px", color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", lineHeight: 1.5, margin: 0, maxWidth: "640px" }}>
          {t("cookieNotice")}{" "}
          <Link href="/cookies" style={{ color: "#06D6A0", fontWeight: 600 }}>
            {t("learnMore")}
          </Link>
        </p>
        <button
          onClick={accept}
          style={{
            backgroundColor: "#4361EE",
            color: "white",
            border: "none",
            padding: "0.5rem 1.25rem",
            borderRadius: "0.625rem",
            fontWeight: 700,
            fontSize: "0.8125rem",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {t("gotIt")}
        </button>
      </div>
    </div>
  );
}
