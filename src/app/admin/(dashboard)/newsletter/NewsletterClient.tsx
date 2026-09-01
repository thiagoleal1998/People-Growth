"use client";

import { useState, useTransition } from "react";
import { Search, Trash2 } from "lucide-react";
import type { Database } from "@/types/database.types";
import { updateSubStatus, deleteSub } from "./actions";

type Sub = Database["public"]["Tables"]["newsletter_subs"]["Row"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function NewsletterClient({ subs }: { subs: Sub[] }) {
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const filtered = subs.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()) || (s.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "white", borderRadius: "0.75rem", padding: "0.75rem 1rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem", maxWidth: "400px" }}>
        <Search size={16} color="#94a3b8" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar inscrito..."
          style={{ border: "none", outline: "none", fontSize: "0.9rem", color: "#0d1b2a", width: "100%", background: "none" }}
        />
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>
            {subs.length === 0 ? "Nenhum inscrito ainda." : "Nenhum inscrito encontrado."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["E-mail", "Nome", "Origem", "Status", "Inscrito em", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 700, color: "#0d1b2a", fontSize: "0.875rem" }}>{sub.email}</td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>{sub.name ?? "—"}</td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>{sub.source ?? "—"}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <select
                        defaultValue={sub.status}
                        onChange={(e) => startTransition(() => updateSubStatus(sub.id, e.target.value as Sub["status"]))}
                        style={{
                          backgroundColor: sub.status === "active" ? "rgba(6,214,160,0.1)" : "rgba(148,163,184,0.15)",
                          color: sub.status === "active" ? "#04a87d" : "#64748b",
                          padding: "0.2rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer",
                        }}
                      >
                        <option value="active">Ativo</option>
                        <option value="unsubscribed">Cancelado</option>
                      </select>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{formatDate(sub.subscribed_at)}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <button
                        onClick={() => { if (confirm(`Remover ${sub.email}?`)) startTransition(() => deleteSub(sub.id)); }}
                        style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                        title="Remover"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
