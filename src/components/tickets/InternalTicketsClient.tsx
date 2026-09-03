"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Field, Input, Textarea, Select } from "@/components/admin/ui";
import type { InternalTicket } from "@/types/database.types";

const statusConfig: Record<InternalTicket["status"], { label: string; color: string; bg: string }> = {
  open: { label: "Aberto", color: "#4361EE", bg: "rgba(67,97,238,0.1)" },
  in_progress: { label: "Em andamento", color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
  resolved: { label: "Resolvido", color: "#04a87d", bg: "rgba(6,214,160,0.1)" },
};

const typeConfig: Record<InternalTicket["type"], { label: string; color: string; bg: string }> = {
  bug: { label: "Erro / bug", color: "#dc2626", bg: "rgba(239,68,68,0.1)" },
  suggestion: { label: "Sugestão de melhoria", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

type Props = {
  tickets: InternalTicket[];
  canManage: boolean;
  createAction: (data: { type: InternalTicket["type"]; title: string; description: string }) => Promise<InternalTicket>;
  updateAction?: (id: string, data: { status: InternalTicket["status"]; admin_response: string }) => Promise<void>;
  deleteAction?: (id: string) => Promise<void>;
};

export function InternalTicketsClient({ tickets, canManage, createAction, updateAction, deleteAction }: Props) {
  const [items, setItems] = useState(tickets);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creating, startCreating] = useTransition();
  const [, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    const type = formData.get("type") as InternalTicket["type"];
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    startCreating(async () => {
      const created = await createAction({ type, title, description });
      setItems((prev) => [created, ...prev]);
      setShowForm(false);
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: showForm ? "var(--admin-surface-alt)" : "#4361EE", color: showForm ? "var(--admin-text)" : "white", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: "pointer" }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancelar" : "Novo chamado"}
        </button>
      </div>

      {showForm && (
        <form
          action={handleCreate}
          style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem", marginBottom: "1.25rem" }}
        >
          <Field label="Tipo">
            <Select name="type" defaultValue="bug" required>
              <option value="bug">Erro / bug — algo não está funcionando</option>
              <option value="suggestion">Sugestão de melhoria — uma ideia para o site ou o painel</option>
            </Select>
          </Field>
          <Field label="Título" hint='Ex.: "Botão de salvar não responde no Safari" ou "Poderia ter um atalho para duplicar artigo"'>
            <Input name="title" required maxLength={150} />
          </Field>
          <Field label="Descrição" hint="Explique com detalhes: o que aconteceu (ou o que você gostaria), em qual página, e como reproduzir o problema, se for um erro.">
            <Textarea name="description" rows={4} required />
          </Field>
          <button
            type="submit"
            disabled={creating}
            style={{ backgroundColor: "#4361EE", color: "white", padding: "0.75rem 1.5rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: creating ? "default" : "pointer", opacity: creating ? 0.7 : 1 }}
          >
            {creating ? "Enviando..." : "Enviar chamado"}
          </button>
        </form>
      )}

      <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
        {items.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.9rem" }}>
            Nenhum chamado interno até agora.
          </div>
        ) : (
          items.map((ticket, idx) => {
            const s = statusConfig[ticket.status];
            const t = typeConfig[ticket.type];
            const expanded = expandedId === ticket.id;
            return (
              <div key={ticket.id} style={{ borderTop: idx === 0 ? "none" : "1px solid var(--admin-border)" }}>
                <div
                  onClick={() => setExpandedId(expanded ? null : ticket.id)}
                  style={{ padding: "1rem 1.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}
                >
                  <span style={{ backgroundColor: t.bg, color: t.color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                    {t.label}
                  </span>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--admin-text)" }}>{ticket.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--admin-muted)" }}>
                      {ticket.created_by_name} ({ticket.created_by_role === "admin" ? "admin" : "autor"}) · {formatDate(ticket.created_at)}
                    </div>
                  </div>
                  <span style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                    {s.label}
                  </span>
                </div>

                {expanded && (
                  <div style={{ padding: "0 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <p style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", whiteSpace: "pre-wrap", margin: 0 }}>{ticket.description}</p>

                    {canManage && updateAction ? (
                      <TicketManageForm ticket={ticket} onUpdate={(data) => {
                        setItems((prev) => prev.map((it) => (it.id === ticket.id ? { ...it, ...data } : it)));
                        startTransition(() => updateAction(ticket.id, data));
                      }} />
                    ) : (
                      ticket.admin_response && (
                        <div style={{ backgroundColor: "var(--admin-surface-alt)", borderRadius: "0.625rem", padding: "0.875rem 1rem" }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", marginBottom: "0.25rem" }}>Resposta da administração</div>
                          <p style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", whiteSpace: "pre-wrap", margin: 0 }}>{ticket.admin_response}</p>
                        </div>
                      )
                    )}

                    {canManage && deleteAction && (
                      <button
                        onClick={() => {
                          if (confirm("Excluir este chamado?")) {
                            setItems((prev) => prev.filter((it) => it.id !== ticket.id));
                            startTransition(() => deleteAction(ticket.id));
                          }
                        }}
                        style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, padding: 0 }}
                      >
                        <Trash2 size={14} /> Excluir chamado
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function TicketManageForm({ ticket, onUpdate }: { ticket: InternalTicket; onUpdate: (data: { status: InternalTicket["status"]; admin_response: string }) => void }) {
  const [status, setStatus] = useState(ticket.status);
  const [response, setResponse] = useState(ticket.admin_response ?? "");
  const [dirty, setDirty] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Field label="Status">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as InternalTicket["status"]);
            setDirty(true);
          }}
        >
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Resposta (visível para quem abriu o chamado)">
        <Textarea
          rows={3}
          value={response}
          onChange={(e) => {
            setResponse(e.target.value);
            setDirty(true);
          }}
          placeholder="Ex.: Corrigido no ar, obrigado por avisar! / Boa ideia, entra no próximo ciclo."
        />
      </Field>
      {dirty && (
        <button
          type="button"
          onClick={() => {
            onUpdate({ status, admin_response: response });
            setDirty(false);
          }}
          style={{ alignSelf: "flex-start", backgroundColor: "#4361EE", color: "white", padding: "0.5rem 1.125rem", borderRadius: "0.5rem", fontWeight: 700, fontSize: "0.8125rem", border: "none", cursor: "pointer" }}
        >
          Salvar
        </button>
      )}
    </div>
  );
}
