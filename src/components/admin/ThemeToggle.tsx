"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem("admin-theme", next ? "dark" : "light");
    } catch {
      /* no-op */
    }
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? "Modo claro" : "Modo escuro"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.625rem 0.875rem",
        borderRadius: "0.5rem",
        fontSize: "0.875rem",
        color: "rgba(255,255,255,0.55)",
        background: "none",
        border: "none",
        cursor: "pointer",
        width: "100%",
      }}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
      {isDark ? "Modo claro" : "Modo escuro"}
    </button>
  );
}
