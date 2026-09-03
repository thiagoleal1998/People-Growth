"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

export function SiteSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push({ pathname: "/buscar", query: { q: trimmed } });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        backgroundColor: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "9999px",
        padding: "0.25rem 0.25rem 0.25rem 0.75rem",
      }}
    >
      <Search size={14} color="rgba(255,255,255,0.5)" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar no site"
        style={{
          background: "none",
          border: "none",
          outline: "none",
          color: "white",
          fontSize: "0.75rem",
          width: "9rem",
        }}
      />
    </form>
  );
}
