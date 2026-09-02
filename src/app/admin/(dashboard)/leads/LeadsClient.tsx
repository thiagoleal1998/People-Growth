"use client";

import { Fragment, useState, useTransition } from "react";
import { Search, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Database } from "@/types/database.types";
import { updateLeadStatus, updateLeadNotes, deleteLead } from "./actions";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

const statusConfig: Record<Lead["status"], { label: string; color: string; bg: string }> = {
  new: { label: "Novo", color: "#4361EE", bg: "rgba(67,97,238,0.1)" },
  contacted: { label: "Em contato", color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
  proposal: { label: "Proposta", color: "#04a87d", bg: "rgba(6,214,160,0.1)" },
  closed: { label: "Fechado", color: "var(--admin-text-secondary)", bg: "rgba(148,163,184,0.1)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function LeadsClient({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = leads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    (l.service_interest ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "var(--admin-surface)", borderRadius: "0.75rem", padding: "0.75rem 1rem", border: "1px solid var(--admin-border-strong)", marginBottom: "1.5rem", maxWidth: "400px" }}>
        <Search size={16} color="var(--admin-faint)" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar lead..."
          style={{ border: "none", outline: "none", fontSize: "0.9rem", color: "var(--admin-text)", width: "100%", background: "none" }}
        />
      </div>

      <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.9rem" }}>
            {leads.length === 0 ? "Nenhum lead recebido ainda." : "Nenhum lead encontrado."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  {["Nome", "E-mail", "WhatsApp", "Serviço", "Status", "Data", "", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const s = statusConfig[lead.status];
                  const isOpen = expanded === lead.id;
                  return (
                    <Fragment key={lead.id}>
                      <tr style={{ borderTop: "1px solid var(--admin-border)" }}>
                        <td style={{ padding: "0.875rem 1.25rem", fontWeight: 700, color: "var(--admin-text)", fontSize: "0.875rem" }}>{lead.name}</td>
                        <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{lead.email}</td>
                        <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{lead.phone ?? "—"}</td>
                        <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem" }}>{lead.service_interest ?? "—"}</td>
                        <td style={{ padding: "0.875rem 1.25rem" }}>
                          <select
                            defaultValue={lead.status}
                            onChange={(e) => startTransition(() => updateLeadStatus(lead.id, e.target.value as Lead["status"]))}
                            style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}
                          >
                            {Object.entries(statusConfig).map(([key, cfg]) => (
                              <option key={key} value={key}>{cfg.label}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{formatDate(lead.created_at)}</td>
                        <td style={{ padding: "0.875rem 1.25rem" }}>
                          <button
                            onClick={() => setExpanded(isOpen ? null : lead.id)}
                            style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.8125rem", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                          >
                            {lead.message ? "Ver" : "Notas"} {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                        <td style={{ padding: "0.875rem 1.25rem" }}>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir o lead de ${lead.name}?`)) startTransition(() => deleteLead(lead.id));
                            }}
                            style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                          <td colSpan={8} style={{ padding: "1rem 1.25rem" }}>
                            {lead.message && (
                              <div style={{ marginBottom: "0.75rem" }}>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", marginBottom: "0.25rem" }}>MENSAGEM</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>{lead.message}</div>
                              </div>
                            )}
                            <NotesEditor leadId={lead.id} initialNotes={lead.notes ?? ""} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function NotesEditor({ leadId, initialNotes }: { leadId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(true);
  const [, startTransition] = useTransition();

  return (
    <div>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", marginBottom: "0.25rem" }}>NOTAS INTERNAS</div>
      <textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
        rows={2}
        style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
      />
      <button
        onClick={() => startTransition(async () => { await updateLeadNotes(leadId, notes); setSaved(true); })}
        style={{ marginTop: "0.5rem", color: "#4361EE", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem" }}
      >
        {saved ? "Salvo" : "Salvar notas"}
      </button>
    </div>
  );
}
