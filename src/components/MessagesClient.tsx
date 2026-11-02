"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, ArrowLeft, MessageSquarePlus, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markThreadRead } from "@/lib/messages-actions";
import type { Message } from "@/types/database.types";

export type MessageRecipient = { id: string; name: string; role: "admin" | "columnist"; roleLabel: string };

export type ConversationSummary = {
  otherId: string;
  otherName: string;
  otherRoleLabel: string;
  lastBody: string;
  lastAt: string;
  unread: number;
};

export function MessagesClient({
  currentUserId,
  recipients,
  initialConversations,
  initialWith,
  initialContext,
}: {
  currentUserId: string;
  recipients: MessageRecipient[];
  initialConversations: ConversationSummary[];
  initialWith?: string;
  initialContext?: { type: string; id: string; title: string };
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialWith ?? initialConversations[0]?.otherId ?? null);
  const [thread, setThread] = useState<Message[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [text, setText] = useState(() =>
    initialWith && initialContext && !initialConversations.some((c) => c.otherId === initialWith) ? `Sobre: "${initialContext.title}"\n\n` : ""
  );
  const [sending, setSending] = useState(false);
  const [pickingRecipient, setPickingRecipient] = useState(false);
  const pendingContext = useRef(initialContext ?? null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const recipientById = useMemo(() => new Map(recipients.map((r) => [r.id, r])), [recipients]);
  const selected = selectedId ? recipientById.get(selectedId) ?? conversations.find((c) => c.otherId === selectedId) : null;

  useEffect(() => {
    if (!selectedId) return;
    const supabase = createClient();
    (async () => {
      setLoadingThread(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const { data } = await client
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedId}),and(sender_id.eq.${selectedId},recipient_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true })
        .limit(500);
      setThread((data ?? []) as Message[]);
      setLoadingThread(false);
      await markThreadRead(selectedId);
      setConversations((prev) => prev.map((c) => (c.otherId === selectedId ? { ...c, unread: 0 } : c)));
    })();
  }, [selectedId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread]);

  async function handleSend() {
    const body = text.trim();
    if (!body || !selectedId || sending) return;
    const recipient = recipientById.get(selectedId);
    if (!recipient) return;
    setSending(true);
    const ctx = pendingContext.current;
    const result = await sendMessage({
      recipientId: selectedId,
      recipientRole: recipient.role,
      body,
      contextType: ctx?.type,
      contextId: ctx?.id,
      contextTitle: ctx?.title,
    });
    setSending(false);
    if (result.error) return;
    pendingContext.current = null;
    const optimistic: Message = {
      id: `local-${Date.now()}`,
      sender_id: currentUserId,
      recipient_id: selectedId,
      body,
      context_type: ctx?.type ?? null,
      context_id: ctx?.id ?? null,
      context_title: ctx?.title ?? null,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setThread((prev) => [...prev, optimistic]);
    setText("");
    setConversations((prev) => {
      const exists = prev.some((c) => c.otherId === selectedId);
      const base = exists
        ? prev.map((c) => (c.otherId === selectedId ? { ...c, lastBody: body, lastAt: optimistic.created_at } : c))
        : [{ otherId: selectedId, otherName: recipient.name, otherRoleLabel: recipient.roleLabel, lastBody: body, lastAt: optimistic.created_at, unread: 0 }, ...prev];
      return [...base].sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
    });
  }

  const availableNewRecipients = recipients.filter((r) => !conversations.some((c) => c.otherId === r.id));

  return (
    <div style={{ display: "flex", height: "calc(100vh - 4rem)", border: "1px solid var(--admin-border)", borderRadius: "1rem", overflow: "hidden", backgroundColor: "var(--admin-surface)" }}>
      <div
        className="messages-list-pane"
        style={{
          width: "300px",
          flexShrink: 0,
          borderRight: "1px solid var(--admin-border)",
          display: selectedId ? undefined : "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--admin-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <strong style={{ fontSize: "0.9375rem", color: "var(--admin-text)" }}>Conversas</strong>
          <button
            type="button"
            onClick={() => setPickingRecipient((v) => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#315E9C", display: "flex", alignItems: "center" }}
            title="Nova mensagem"
          >
            <MessageSquarePlus size={20} />
          </button>
        </div>

        {pickingRecipient && (
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--admin-border)" }}>
            {availableNewRecipients.length === 0 ? (
              <div style={{ fontSize: "0.8125rem", color: "var(--admin-faint)" }}>Nenhum novo contato disponível.</div>
            ) : (
              availableNewRecipients.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(r.id);
                    setPickingRecipient(false);
                  }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.25rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "var(--admin-text)" }}
                >
                  {r.name} <span style={{ color: "var(--admin-faint)", fontSize: "0.75rem" }}>({r.roleLabel})</span>
                </button>
              ))
            )}
          </div>
        )}

        {conversations.length === 0 ? (
          <div style={{ padding: "1.5rem 1rem", color: "var(--admin-faint)", fontSize: "0.8125rem" }}>Nenhuma conversa ainda.</div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.otherId}
              type="button"
              onClick={() => setSelectedId(c.otherId)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "0.875rem 1rem",
                background: c.otherId === selectedId ? "rgba(49,94,156,0.08)" : "none",
                border: "none",
                borderBottom: "1px solid var(--admin-border)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)" }}>{c.otherName}</span>
                {c.unread > 0 && (
                  <span style={{ backgroundColor: "#dc2626", color: "white", fontSize: "0.6875rem", fontWeight: 800, minWidth: "1.125rem", height: "1.125rem", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {c.unread > 99 ? "99+" : c.unread}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.125rem" }}>{c.otherRoleLabel}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--admin-text-secondary)", marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastBody}</div>
            </button>
          ))
        )}
      </div>

      <div
        className="messages-thread-pane"
        style={{ flex: 1, display: selectedId ? "flex" : "none", flexDirection: "column", minWidth: 0 }}
      >
        {!selected ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-faint)", flexDirection: "column", gap: "0.5rem" }}>
            <MessageSquare size={32} />
            <span style={{ fontSize: "0.875rem" }}>Selecione uma conversa</span>
          </div>
        ) : (
          <>
            <div style={{ padding: "1rem", borderBottom: "1px solid var(--admin-border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="messages-back-btn"
                style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "var(--admin-text)" }}
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--admin-text)" }}>{"name" in selected ? selected.name : selected.otherName}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>{"roleLabel" in selected ? selected.roleLabel : selected.otherRoleLabel}</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {loadingThread ? null : (
                thread.map((m) => {
                  const mine = m.sender_id === currentUserId;
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                      <div
                        style={{
                          maxWidth: "70%",
                          backgroundColor: mine ? "#315E9C" : "var(--admin-border)",
                          color: mine ? "white" : "var(--admin-text)",
                          borderRadius: "0.75rem",
                          padding: "0.625rem 0.875rem",
                        }}
                      >
                        {m.context_title && (
                          <div style={{ fontSize: "0.6875rem", fontWeight: 700, opacity: 0.8, marginBottom: "0.25rem" }}>
                            Sobre: &ldquo;{m.context_title}&rdquo;
                          </div>
                        )}
                        <div style={{ fontSize: "0.875rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: "0.875rem 1rem", borderTop: "1px solid var(--admin-border)", display: "flex", gap: "0.625rem", alignItems: "flex-end" }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escreva uma mensagem..."
                rows={2}
                style={{ flex: 1, resize: "none", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", fontFamily: "inherit", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !text.trim()}
                style={{ backgroundColor: "#315E9C", color: "white", border: "none", borderRadius: "0.5rem", width: "2.5rem", height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: sending ? "default" : "pointer", opacity: sending || !text.trim() ? 0.6 : 1, flexShrink: 0 }}
              >
                <Send size={17} />
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .messages-list-pane { width: 100% !important; border-right: none !important; }
          .messages-back-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
