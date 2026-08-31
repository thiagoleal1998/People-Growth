"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";

const allLeads = [
  { id: "1", name: "Marina Souza", email: "marina@empresa.com", phone: "(11) 99999-1111", service: "Consultoria Estratégica", status: "new", date: "18/06/2025", notes: "" },
  { id: "2", name: "João Pedro Lima", email: "joao@startup.io", phone: "(11) 98888-2222", service: "IA para Negócios", status: "contacted", date: "18/06/2025", notes: "Reunião agendada para sexta." },
  { id: "3", name: "Carla Mendes", email: "carla@corp.com.br", phone: "(21) 97777-3333", service: "Treinamentos", status: "proposal", date: "17/06/2025", notes: "Proposta enviada. Aguardando retorno." },
  { id: "4", name: "Ricardo Oliveira", email: "ricardo@pmebr.com", phone: "(31) 96666-4444", service: "Marketing Digital", status: "new", date: "17/06/2025", notes: "" },
  { id: "5", name: "Flávia Gonçalves", email: "flavia@biz.net", phone: "(41) 95555-5555", service: "Mentoria", status: "closed", date: "15/06/2025", notes: "Fechado! Início em julho." },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Novo", color: "#4361EE", bg: "rgba(67,97,238,0.1)" },
  contacted: { label: "Em contato", color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
  proposal: { label: "Proposta", color: "#04a87d", bg: "rgba(6,214,160,0.1)" },
  closed: { label: "Fechado", color: "#475569", bg: "rgba(148,163,184,0.1)" },
};

const columns = ["new", "contacted", "proposal", "closed"];
const columnLabels: Record<string, string> = { new: "Novos", contacted: "Em Contato", proposal: "Proposta", closed: "Fechados" };

export default function LeadsPage() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");

  const filtered = allLeads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "0.25rem" }}>Leads / CRM</h1>
          <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>{allLeads.length} leads no total</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {(["list", "kanban"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.625rem",
                border: "1px solid",
                borderColor: view === v ? "#4361EE" : "#e2e8f0",
                backgroundColor: view === v ? "#4361EE" : "white",
                color: view === v ? "white" : "#475569",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {v === "list" ? "Lista" : "Kanban"}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "white", borderRadius: "0.75rem", padding: "0.75rem 1rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem", maxWidth: "400px" }}>
        <Search size={16} color="#94a3b8" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar lead..."
          style={{ border: "none", outline: "none", fontSize: "0.9rem", color: "#0d1b2a", width: "100%", background: "none" }}
        />
      </div>

      {view === "list" ? (
        <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["Nome", "E-mail", "WhatsApp", "Serviço", "Status", "Data", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ id, name, email, phone, service, status, date }) => {
                  const s = statusConfig[status];
                  return (
                    <tr key={id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.875rem 1.25rem", fontWeight: 700, color: "#0d1b2a", fontSize: "0.875rem" }}>{name}</td>
                      <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>{email}</td>
                      <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>{phone}</td>
                      <td style={{ padding: "0.875rem 1.25rem", color: "#475569", fontSize: "0.875rem" }}>{service}</td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <select
                          defaultValue={status}
                          style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}
                        >
                          {Object.entries(statusConfig).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{date}</td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <button style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.8125rem", background: "none", border: "none", cursor: "pointer" }}>Ver</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", alignItems: "start" }}>
          {columns.map((col) => {
            const colLeads = allLeads.filter((l) => l.status === col);
            const cfg = statusConfig[col];
            return (
              <div key={col} style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.875rem", color: cfg.color }}>{columnLabels[col]}</span>
                  <span style={{ backgroundColor: cfg.bg, color: cfg.color, width: "1.5rem", height: "1.5rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800 }}>
                    {colLeads.length}
                  </span>
                </div>
                <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {colLeads.map(({ name, email, service, date }) => (
                    <div key={email} style={{ backgroundColor: "#f8fafc", borderRadius: "0.625rem", padding: "0.875rem", border: "1px solid #f1f5f9", cursor: "pointer" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0d1b2a", marginBottom: "0.25rem" }}>{name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>{service}</div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{date}</div>
                    </div>
                  ))}
                  {colLeads.length === 0 && (
                    <div style={{ textAlign: "center", color: "#cbd5e1", fontSize: "0.8125rem", padding: "1rem" }}>Nenhum lead</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
