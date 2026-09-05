"use client";

import { useEffect, useState, useTransition } from "react";
import { X, Lightbulb, Bug, Plus, UserCog, ArrowUpCircle, BellRing, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { formatTicketId } from "@/lib/display-id";
import type { InternalTicket, TicketEvent, TicketComment } from "@/types/database.types";

const statusConfig: Record<InternalTicket["status"], { label: string; color: string; bg: string }> = {
  open: { label: "Aberto", color: "#4361EE", bg: "rgba(67,97,238,0.1)" },
  in_progress: { label: "Em andamento", color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
  resolved: { label: "Resolvido", color: "#04a87d", bg: "rgba(6,214,160,0.1)" },
};

const typeConfig: Record<InternalTicket["type"], { label: string; icon: typeof Bug; color: string }> = {
  bug: { label: "Erro / bug", icon: Bug, color: "#dc2626" },
  suggestion: { label: "Sugestão de melhoria", icon: Lightbulb, color: "#cc9200" },
};

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

type TimelineItem =
  | { kind: "opened"; created_at: string; actor_name: string }
  | { kind: "event"; created_at: string; event: TicketEvent }
  | { kind: "comment"; created_at: string; comment: TicketComment }
  | { kind: "legacy_response"; created_at: string; body: string };

export type Member = { id: string; name: string };

export function TicketModal({
  ticket,
  canManage,
  members,
  onClose,
  onUpdateStatus,
  onAssign,
  onNotify,
  onComment,
}: {
  ticket: InternalTicket;
  canManage: boolean;
  members: Member[];
  onClose: () => void;
  onUpdateStatus?: (status: InternalTicket["status"]) => void;
  onAssign?: (userId: string | null) => void;
  onNotify?: () => void;
  onComment: (body: string) => Promise<void>;
}) {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorKey, setEditorKey] = useState(0);
  const [sending, startSending] = useTransition();
  const t = typeConfig[ticket.type];
  const TypeIcon = t.icon;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const [{ data: eventsData }, { data: commentsData }] = await Promise.all([
        supabase.from("ticket_events").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: true }),
        supabase.from("ticket_comments").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;
      setEvents((eventsData ?? []) as TicketEvent[]);
      setComments((commentsData ?? []) as TicketComment[]);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ticket.id]);

  const timeline: TimelineItem[] = [
    { kind: "opened" as const, created_at: ticket.created_at, actor_name: ticket.created_by_name },
    ...(ticket.admin_response
      ? [{ kind: "legacy_response" as const, created_at: ticket.updated_at, body: ticket.admin_response }]
      : []),
    ...events.map((event) => ({ kind: "event" as const, created_at: event.created_at, event })),
    ...comments.map((comment) => ({ kind: "comment" as const, created_at: comment.created_at, comment })),
  ].sort((a, b) => a.created_at.localeCompare(b.created_at));

  function handleSubmitReply(formData: FormData) {
    const body = String(formData.get("reply") ?? "").trim();
    if (!body) return;
    startSending(async () => {
      await onComment(body);
      setComments((prev) => [
        ...prev,
        { id: `temp-${Date.now()}`, ticket_id: ticket.id, author_id: null, author_name: "Você", body, created_at: new Date().toISOString() },
      ]);
      setEditorKey((k) => k + 1); // remounts MarkdownEditor with an empty defaultValue
    });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(13,27,42,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 400,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--admin-surface)",
          color: "var(--admin-text)",
          borderRadius: "1rem",
          maxWidth: "620px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem 1rem", borderBottom: "1px solid var(--admin-border)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }}>
              <TypeIcon size={18} color={t.color} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: "var(--admin-muted)", fontSize: "0.9375rem", flexShrink: 0 }}>
                {formatTicketId(ticket.ticket_number)}
              </span>
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ticket.title}
              </h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Fechar" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-faint)", flexShrink: 0 }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.8125rem", color: "var(--admin-muted)", flexWrap: "wrap" }}>
            <span>{ticket.created_by_name}</span>
            <span>·</span>
            <span>aberto em {formatDateShort(ticket.created_at)}</span>
            <span
              style={{ backgroundColor: statusConfig[ticket.status].bg, color: statusConfig[ticket.status].color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}
            >
              {statusConfig[ticket.status].label}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="admin-scroll" style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 }}>
          <div style={{ backgroundColor: "var(--admin-surface-alt)", borderRadius: "0.625rem", padding: "1rem 1.125rem", fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {ticket.description}
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--admin-faint)", flexWrap: "wrap" }}>
            {ticket.page_path && <span>Página: {ticket.page_path}</span>}
            <span>{formatDateTime(ticket.created_at)}</span>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>
              Status:
              {canManage && onUpdateStatus ? (
                <select
                  value={ticket.status}
                  onChange={(e) => onUpdateStatus(e.target.value as InternalTicket["status"])}
                  style={{ backgroundColor: statusConfig[ticket.status].bg, color: statusConfig[ticket.status].color, padding: "0.3rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.8125rem", fontWeight: 700, border: "none", cursor: "pointer" }}
                >
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              ) : (
                <strong style={{ color: "var(--admin-text)" }}>{statusConfig[ticket.status].label}</strong>
              )}
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>
              Responsável:
              {canManage && onAssign ? (
                <select
                  value={ticket.assigned_to ?? ""}
                  onChange={(e) => onAssign(e.target.value || null)}
                  style={{ padding: "0.3rem 0.625rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", cursor: "pointer" }}
                >
                  <option value="">— ninguém —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              ) : (
                <strong style={{ color: "var(--admin-text)" }}>{ticket.assigned_to_name ?? "— ninguém —"}</strong>
              )}
            </label>

            {canManage && onNotify && (
              <button
                type="button"
                onClick={onNotify}
                disabled={!ticket.assigned_to}
                title={ticket.assigned_to ? "Avisar o responsável pelo painel" : "Defina um responsável primeiro"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4375rem",
                  padding: "0.4375rem 0.875rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--admin-border-strong)",
                  backgroundColor: "var(--admin-surface)",
                  color: ticket.assigned_to ? "var(--admin-text)" : "var(--admin-faint)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: ticket.assigned_to ? "pointer" : "default",
                }}
              >
                <BellRing size={14} /> Notificar membro
              </button>
            )}
          </div>

          {/* Timeline */}
          <div style={{ marginTop: "1.75rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-faint)", letterSpacing: "0.04em", marginBottom: "0.875rem" }}>
              LINHA DO TEMPO
            </div>
            {loading ? (
              <div style={{ fontSize: "0.8125rem", color: "var(--admin-faint)" }}>Carregando...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {timeline.map((item, i) => {
                  if (item.kind === "opened") {
                    return (
                      <TimelineRow key={`opened-${i}`} icon={<Plus size={15} />} iconColor="#4361EE" iconBg="rgba(67,97,238,0.1)" createdAt={item.created_at}>
                        <strong>{item.actor_name}</strong> abriu o chamado
                      </TimelineRow>
                    );
                  }
                  if (item.kind === "event") {
                    const iconMap = {
                      assigned: { icon: <UserCog size={15} />, color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
                      status_changed: { icon: <ArrowUpCircle size={15} />, color: "#04a87d", bg: "rgba(6,214,160,0.1)" },
                      notified: { icon: <BellRing size={15} />, color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
                    } as const;
                    const cfg = iconMap[item.event.event_type];
                    return (
                      <TimelineRow key={item.event.id} icon={cfg.icon} iconColor={cfg.color} iconBg={cfg.bg} createdAt={item.created_at}>
                        {item.event.detail}
                      </TimelineRow>
                    );
                  }
                  if (item.kind === "legacy_response") {
                    return (
                      <TimelineRow key={`legacy-${i}`} icon={<MessageSquare size={15} />} iconColor="var(--admin-muted)" iconBg="var(--admin-surface-alt)" createdAt={item.created_at}>
                        <div style={{ marginBottom: "0.25rem" }}><strong>Resposta anterior</strong></div>
                        <div style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", whiteSpace: "pre-wrap" }}>{item.body}</div>
                      </TimelineRow>
                    );
                  }
                  return (
                    <TimelineRow key={item.comment.id} icon={<MessageSquare size={15} />} iconColor="var(--admin-muted)" iconBg="var(--admin-surface-alt)" createdAt={item.created_at}>
                      <div style={{ marginBottom: "0.25rem" }}><strong>{item.comment.author_name}</strong></div>
                      <div
                        style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdownLite(item.comment.body) }}
                      />
                    </TimelineRow>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Reply editor */}
        <form action={handleSubmitReply} style={{ borderTop: "1px solid var(--admin-border)", padding: "1rem 1.5rem" }}>
          <MarkdownEditor key={editorKey} name="reply" defaultValue="" minHeight={90} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.625rem" }}>
            <button
              type="submit"
              disabled={sending}
              style={{
                backgroundColor: "#4361EE",
                color: "white",
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                fontWeight: 700,
                fontSize: "0.8125rem",
                border: "none",
                cursor: sending ? "default" : "pointer",
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TimelineRow({ icon, iconColor, iconBg, createdAt, children }: { icon: React.ReactNode; iconColor: string; iconBg: string; createdAt: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "9999px", backgroundColor: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: "0.125rem" }}>
        <div style={{ fontSize: "0.875rem", color: "var(--admin-text)" }}>{children}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.125rem" }}>{formatDateTime(createdAt)}</div>
      </div>
    </div>
  );
}
