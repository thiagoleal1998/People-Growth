"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { ErrorReport } from "@/types/database.types";
import { updateErrorReportStatus, deleteErrorReport } from "./actions";

const statusConfig: Record<ErrorReport["status"], { label: string; color: string; bg: string }> = {
  new: { label: "Novo", color: "#4361EE", bg: "rgba(67,97,238,0.1)" },
  reviewing: { label: "Em análise", color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
  resolved: { label: "Resolvido", color: "#04a87d", bg: "rgba(6,214,160,0.1)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export function ErrorReportsClient({ reports }: { reports: ErrorReport[] }) {
  const [, startTransition] = useTransition();
  const [items, setItems] = useState(reports);

  return (
    <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
      {items.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>
          Nenhum erro reportado até agora.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Descrição", "Página", "E-mail", "Status", "Data", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((report) => {
                const s = statusConfig[report.status];
                return (
                  <tr key={report.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.875rem 1.25rem", color: "#334155", fontSize: "0.875rem", maxWidth: "360px" }}>{report.description}</td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem" }}>
                      <a href={report.page_url} target="_blank" rel="noopener noreferrer" style={{ color: "#4361EE" }}>
                        {report.page_url.replace(/^https?:\/\/[^/]+/, "") || "/"}
                      </a>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>{report.email ?? "—"}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <select
                        defaultValue={report.status}
                        onChange={(e) => {
                          const status = e.target.value as ErrorReport["status"];
                          setItems((prev) => prev.map((r) => (r.id === report.id ? { ...r, status } : r)));
                          startTransition(() => updateErrorReportStatus(report.id, status));
                        }}
                        style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}
                      >
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{formatDate(report.created_at)}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <button
                        onClick={() => {
                          if (confirm("Excluir este erro reportado?")) {
                            setItems((prev) => prev.filter((r) => r.id !== report.id));
                            startTransition(() => deleteErrorReport(report.id));
                          }
                        }}
                        style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
