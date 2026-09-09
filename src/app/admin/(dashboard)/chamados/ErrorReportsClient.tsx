"use client";

import { useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { ErrorReport } from "@/types/database.types";
import { confirmDialog } from "@/components/admin/dialog-store";
import { KanbanBoard, type KanbanColumn } from "@/components/admin/KanbanBoard";
import { ListKanbanToolbar, type BoardView } from "@/components/admin/ListKanbanToolbar";
import { dateKeySaoPaulo } from "@/lib/date-key";
import { updateErrorReportStatus, deleteErrorReport } from "./actions";

const statusConfig: Record<ErrorReport["status"], { label: string; color: string; bg: string }> = {
  new: { label: "Novo", color: "#4361EE", bg: "rgba(67,97,238,0.1)" },
  reviewing: { label: "Em análise", color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
  resolved: { label: "Resolvido", color: "#04a87d", bg: "rgba(6,214,160,0.1)" },
};

const columns: KanbanColumn<ErrorReport["status"]>[] = [
  { id: "new", label: "Novo", color: statusConfig.new.color },
  { id: "reviewing", label: "Em análise", color: statusConfig.reviewing.color },
  { id: "resolved", label: "Resolvido", color: statusConfig.resolved.color },
];

function formatDate(iso: string) {
  // timeZone pinned to avoid a hydration mismatch — see ArticlesTabs.tsx.
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function ErrorReportsClient({ reports }: { reports: ErrorReport[] }) {
  const [, startTransition] = useTransition();
  const [items, setItems] = useState(reports);
  const [view, setView] = useState<BoardView>("kanban");
  const [search, setSearch] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const emailOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    for (const r of items) {
      const key = r.email ?? "__anon__";
      if (seen.has(key)) continue;
      seen.add(key);
      options.push({ value: key, label: r.email ?? "Anônimo (sem e-mail)" });
    }
    return options;
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => {
      if (q && !r.description.toLowerCase().includes(q) && !r.page_url.toLowerCase().includes(q)) return false;
      if (emailFilter && (r.email ?? "__anon__") !== emailFilter) return false;
      const day = dateKeySaoPaulo(r.created_at);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [items, search, emailFilter, dateFrom, dateTo]);

  function changeStatus(id: string, status: ErrorReport["status"]) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    startTransition(() => updateErrorReportStatus(id, status));
  }

  async function remove(id: string) {
    if (await confirmDialog("Excluir este erro reportado?", { danger: true, confirmText: "Excluir" })) {
      setItems((prev) => prev.filter((r) => r.id !== id));
      startTransition(() => deleteErrorReport(id));
    }
  }

  return (
    <div>
      <ListKanbanToolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar por descrição ou página..."
        userOptions={emailOptions}
        userValue={emailFilter}
        onUserChange={setEmailFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
      />

      {filtered.length === 0 ? (
        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "3rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.9rem" }}>
          Nenhum erro reportado encontrado.
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard
          columns={columns}
          items={filtered}
          getId={(r) => r.id}
          getStatus={(r) => r.status}
          onMove={(r, status) => changeStatus(r.id, status)}
          renderCard={(report) => (
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "var(--admin-text)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                  {report.description}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(report.id);
                  }}
                  style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "0.125rem" }}
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <a
                href={report.page_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display: "block", color: "#4361EE", fontSize: "0.75rem", marginTop: "0.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {report.page_url.replace(/^https?:\/\/[^/]+/, "") || "/"}
              </a>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.625rem", fontSize: "0.75rem", color: "var(--admin-faint)" }}>
                <span>{report.email ?? "Anônimo"}</span>
                <span>{formatDate(report.created_at)}</span>
              </div>
            </div>
          )}
        />
      ) : (
        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  {["Descrição", "Página", "E-mail", "Status", "Data", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => {
                  const s = statusConfig[report.status];
                  return (
                    <tr key={report.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                      <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem", maxWidth: "360px" }}>{report.description}</td>
                      <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem" }}>
                        <a href={report.page_url} target="_blank" rel="noopener noreferrer" style={{ color: "#4361EE" }}>
                          {report.page_url.replace(/^https?:\/\/[^/]+/, "") || "/"}
                        </a>
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{report.email ?? "—"}</td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <select
                          value={report.status}
                          onChange={(e) => changeStatus(report.id, e.target.value as ErrorReport["status"])}
                          style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}
                        >
                          {Object.entries(statusConfig).map(([key, cfg]) => (
                            <option key={key} value={key}>
                              {cfg.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{formatDate(report.created_at)}</td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <button onClick={() => remove(report.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }} title="Excluir">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
