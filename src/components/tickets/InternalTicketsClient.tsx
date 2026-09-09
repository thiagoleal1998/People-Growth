"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2, X, Lightbulb, Bug } from "lucide-react";
import { Field, Input, Select } from "@/components/admin/ui";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { confirmDialog } from "@/components/admin/dialog-store";
import { KanbanBoard, type KanbanColumn } from "@/components/admin/KanbanBoard";
import { ListKanbanToolbar, type BoardView } from "@/components/admin/ListKanbanToolbar";
import { dateKeySaoPaulo } from "@/lib/date-key";
import { formatTicketId } from "@/lib/display-id";
import { TicketModal, type Member } from "./TicketModal";
import type { InternalTicket } from "@/types/database.types";

const statusConfig: Record<InternalTicket["status"], { label: string; color: string; bg: string }> = {
  open: { label: "Aberto", color: "#4361EE", bg: "rgba(67,97,238,0.1)" },
  in_progress: { label: "Em andamento", color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
  resolved: { label: "Resolvido", color: "#04a87d", bg: "rgba(6,214,160,0.1)" },
};

const columns: KanbanColumn<InternalTicket["status"]>[] = [
  { id: "open", label: "Aberto", color: statusConfig.open.color },
  { id: "in_progress", label: "Em andamento", color: statusConfig.in_progress.color },
  { id: "resolved", label: "Resolvido", color: statusConfig.resolved.color },
];

const UNASSIGNED = "__unassigned__";

const typeConfig: Record<InternalTicket["type"], { label: string; icon: typeof Bug; color: string; bg: string }> = {
  bug: { label: "Erro / bug", icon: Bug, color: "#dc2626", bg: "rgba(239,68,68,0.1)" },
  suggestion: { label: "Sugestão de melhoria", icon: Lightbulb, color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
};

function formatDate(iso: string) {
  // timeZone pinned to avoid a hydration mismatch — see ArticlesTabs.tsx.
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

type Props = {
  tickets: InternalTicket[];
  canManage: boolean;
  members?: Member[];
  createAction: (data: { type: InternalTicket["type"]; title: string; description: string; page?: string }) => Promise<InternalTicket>;
  updateStatusAction?: (id: string, status: InternalTicket["status"]) => Promise<void>;
  assignAction?: (id: string, userId: string | null) => Promise<void>;
  notifyAction?: (id: string) => Promise<void>;
  commentAction: (id: string, body: string) => Promise<void>;
  deleteAction?: (id: string) => Promise<void>;
};

export function InternalTicketsClient({
  tickets,
  canManage,
  members = [],
  createAction,
  updateStatusAction,
  assignAction,
  notifyAction,
  commentAction,
  deleteAction,
}: Props) {
  const [items, setItems] = useState(tickets);
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, startCreating] = useTransition();
  const [, startTransition] = useTransition();
  const [view, setView] = useState<BoardView>("kanban");
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const openTicket = items.find((i) => i.id === openId) ?? null;

  const userOptions = useMemo(() => [{ value: UNASSIGNED, label: "Não atribuído" }, ...members.map((m) => ({ value: m.id, label: m.name }))], [members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((ticket) => {
      if (q && !ticket.title.toLowerCase().includes(q) && !ticket.description.toLowerCase().includes(q)) return false;
      if (userFilter === UNASSIGNED && ticket.assigned_to) return false;
      if (userFilter && userFilter !== UNASSIGNED && ticket.assigned_to !== userFilter) return false;
      const day = dateKeySaoPaulo(ticket.created_at);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [items, search, userFilter, dateFrom, dateTo]);

  async function changeStatus(id: string, status: InternalTicket["status"]) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
    if (updateStatusAction) await updateStatusAction(id, status);
  }

  function handleCreate(formData: FormData) {
    const type = formData.get("type") as InternalTicket["type"];
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    startCreating(async () => {
      const created = await createAction({ type, title, description, page: window.location.pathname });
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
            <MarkdownEditor name="description" defaultValue="" minHeight={140} />
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

      <ListKanbanToolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar por título ou descrição..."
        userOptions={userOptions}
        userValue={userFilter}
        onUserChange={setUserFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
      />

      {filtered.length === 0 ? (
        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "3rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.9rem" }}>
          Nenhum chamado interno encontrado.
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard
          columns={columns}
          items={filtered}
          getId={(ticket) => ticket.id}
          getStatus={(ticket) => ticket.status}
          onMove={(ticket, status) => changeStatus(ticket.id, status)}
          onCardClick={(ticket) => setOpenId(ticket.id)}
          renderCard={(ticket) => {
            const t = typeConfig[ticket.type];
            const TypeIcon = t.icon;
            return (
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", backgroundColor: t.bg, color: t.color, padding: "0.2rem 0.5rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700, flexShrink: 0 }}>
                    <TypeIcon size={11} /> {t.label}
                  </span>
                  {canManage && deleteAction && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (await confirmDialog("Excluir este chamado?", { danger: true, confirmText: "Excluir" })) {
                          setItems((prev) => prev.filter((it) => it.id !== ticket.id));
                          startTransition(() => deleteAction(ticket.id));
                        }
                      }}
                      style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "0.125rem" }}
                      title="Excluir chamado"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)", marginTop: "0.5rem" }}>
                  <span style={{ color: "var(--admin-faint)", fontWeight: 700, marginRight: "0.375rem" }}>{formatTicketId(ticket.ticket_number)}</span>
                  {ticket.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-muted)", marginTop: "0.375rem" }}>{ticket.assigned_to_name ?? "Não atribuído"}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.375rem" }}>{formatDate(ticket.created_at)}</div>
              </div>
            );
          }}
        />
      ) : (
        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
          {filtered.map((ticket, idx) => {
            const s = statusConfig[ticket.status];
            const t = typeConfig[ticket.type];
            const TypeIcon = t.icon;
            return (
              <div key={ticket.id} style={{ borderTop: idx === 0 ? "none" : "1px solid var(--admin-border)", display: "flex", alignItems: "center" }}>
                <div
                  onClick={() => setOpenId(ticket.id)}
                  style={{ flex: 1, padding: "1rem 1.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", backgroundColor: t.bg, color: t.color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                    <TypeIcon size={12} /> {t.label}
                  </span>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--admin-text)" }}>
                      <span style={{ color: "var(--admin-faint)", fontWeight: 700, marginRight: "0.5rem" }}>{formatTicketId(ticket.ticket_number)}</span>
                      {ticket.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--admin-muted)" }}>
                      {ticket.created_by_name} ({ticket.created_by_role === "admin" ? "admin" : "autor"}) · {formatDate(ticket.created_at)}
                    </div>
                  </div>
                  <span style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                    {s.label}
                  </span>
                </div>
                {canManage && deleteAction && (
                  <button
                    onClick={async () => {
                      if (await confirmDialog("Excluir este chamado?", { danger: true, confirmText: "Excluir" })) {
                        setItems((prev) => prev.filter((it) => it.id !== ticket.id));
                        startTransition(() => deleteAction(ticket.id));
                      }
                    }}
                    style={{ padding: "0.5rem 1.25rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
                    title="Excluir chamado"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {openTicket && (
        <TicketModal
          ticket={openTicket}
          canManage={canManage}
          members={members}
          onClose={() => setOpenId(null)}
          onUpdateStatus={canManage && updateStatusAction ? (status) => changeStatus(openTicket.id, status) : undefined}
          onAssign={
            canManage && assignAction
              ? async (userId) => {
                  const name = userId ? members.find((m) => m.id === userId)?.name ?? null : null;
                  // Mirrors the server's own auto-transition (assignTicket in
                  // actions.ts): assigning someone to a still-open ticket
                  // moves it to "in progress" immediately in the UI too.
                  setItems((prev) =>
                    prev.map((it) =>
                      it.id === openTicket.id
                        ? { ...it, assigned_to: userId, assigned_to_name: name, status: userId && it.status === "open" ? "in_progress" : it.status }
                        : it
                    )
                  );
                  await assignAction(openTicket.id, userId);
                }
              : undefined
          }
          onNotify={
            canManage && notifyAction
              ? () => notifyAction(openTicket.id)
              : undefined
          }
          onComment={(body) => commentAction(openTicket.id, body)}
        />
      )}
    </div>
  );
}
