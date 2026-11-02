"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, ArrowLeft, MessageSquarePlus, MessageSquare, Bold, Italic, Mic, Square, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markThreadRead } from "@/lib/messages-actions";
import { renderChatText } from "@/lib/markdown-lite";
import { alertDialog } from "@/components/admin/dialog-store";
import type { Message } from "@/types/database.types";

export type MessageRecipient = { id: string; name: string; role: "admin" | "columnist"; roleLabel: string; photoUrl?: string };

export type ConversationSummary = {
  otherId: string;
  otherName: string;
  otherRoleLabel: string;
  otherPhotoUrl?: string;
  lastBody: string;
  lastAt: string;
  unread: number;
};

function Avatar({ name, photoUrl, size }: { name: string; photoUrl?: string; size: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt={name} width={size} height={size} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#315E9C",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

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
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const pendingContext = useRef(initialContext ?? null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recipientById = useMemo(() => new Map(recipients.map((r) => [r.id, r])), [recipients]);
  const selectedEntry = selectedId ? recipientById.get(selectedId) ?? conversations.find((c) => c.otherId === selectedId) : null;
  const selected = selectedEntry
    ? "name" in selectedEntry
      ? { name: selectedEntry.name, roleLabel: selectedEntry.roleLabel, photoUrl: selectedEntry.photoUrl }
      : { name: selectedEntry.otherName, roleLabel: selectedEntry.otherRoleLabel, photoUrl: selectedEntry.otherPhotoUrl }
    : null;

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

  function appendSentMessage(recipient: MessageRecipient, optimistic: Message, previewText: string) {
    setThread((prev) => [...prev, optimistic]);
    setConversations((prev) => {
      const exists = prev.some((c) => c.otherId === recipient.id);
      const base = exists
        ? prev.map((c) => (c.otherId === recipient.id ? { ...c, lastBody: previewText, lastAt: optimistic.created_at } : c))
        : [{ otherId: recipient.id, otherName: recipient.name, otherRoleLabel: recipient.roleLabel, otherPhotoUrl: recipient.photoUrl, lastBody: previewText, lastAt: optimistic.created_at, unread: 0 }, ...prev];
      return [...base].sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
    });
  }

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
    if (result.error) {
      await alertDialog(`Não foi possível enviar: ${result.error}`);
      return;
    }
    pendingContext.current = null;
    const optimistic: Message = {
      id: `local-${Date.now()}`,
      sender_id: currentUserId,
      recipient_id: selectedId,
      body,
      audio_url: null,
      context_type: ctx?.type ?? null,
      context_id: ctx?.id ?? null,
      context_title: ctx?.title ?? null,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setText("");
    appendSentMessage(recipient, optimistic, body);
  }

  function applyFormat(marker: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const selected = text.slice(start, end) || "texto";
    const newText = `${text.slice(0, start)}${marker}${selected}${marker}${text.slice(end)}`;
    setText(newText);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + marker.length, start + marker.length + selected.length);
    });
  }

  function stopMicTracks() {
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    recordTimerRef.current = null;
  }

  async function startRecording() {
    if (!selectedId || recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch {
      await alertDialog("Não foi possível acessar o microfone. Verifique a permissão do navegador.");
    }
  }

  function cancelRecording() {
    mediaRecorderRef.current?.stop();
    stopMicTracks();
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setRecording(false);
  }

  async function finishRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || !selectedId) return;
    const recipient = recipientById.get(selectedId);
    if (!recipient) {
      cancelRecording();
      return;
    }

    const blobReady = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" }));
    });
    recorder.stop();
    stopMicTracks();
    setRecording(false);
    const blob = await blobReady;
    mediaRecorderRef.current = null;

    setUploadingAudio(true);
    const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
    const formData = new FormData();
    formData.append("file", blob, `voice.${ext}`);
    const uploadRes = await fetch("/api/messages/upload-audio", { method: "POST", body: formData });
    const uploadData = await uploadRes.json().catch(() => ({}));
    setUploadingAudio(false);
    if (!uploadRes.ok || !uploadData.url) {
      await alertDialog(`Não foi possível enviar o áudio: ${uploadData.error ?? "falha no upload"}.`);
      return;
    }

    const ctx = pendingContext.current;
    const result = await sendMessage({
      recipientId: selectedId,
      recipientRole: recipient.role,
      body: "",
      audioUrl: uploadData.url,
      contextType: ctx?.type,
      contextId: ctx?.id,
      contextTitle: ctx?.title,
    });
    if (result.error) {
      await alertDialog(`Não foi possível enviar: ${result.error}`);
      return;
    }
    pendingContext.current = null;
    const optimistic: Message = {
      id: `local-${Date.now()}`,
      sender_id: currentUserId,
      recipient_id: selectedId,
      body: "",
      audio_url: uploadData.url,
      context_type: ctx?.type ?? null,
      context_id: ctx?.id ?? null,
      context_title: ctx?.title ?? null,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    appendSentMessage(recipient, optimistic, "🎤 Mensagem de voz");
  }

  useEffect(() => {
    return () => stopMicTracks();
  }, []);

  const availableNewRecipients = recipients.filter((r) => !conversations.some((c) => c.otherId === r.id));

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0, border: "1px solid var(--admin-border)", borderRadius: "1rem", overflow: "hidden", backgroundColor: "var(--admin-surface)" }}>
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
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", textAlign: "left", padding: "0.5rem 0.25rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "var(--admin-text)" }}
                >
                  <Avatar name={r.name} photoUrl={r.photoUrl} size={28} />
                  <span>
                    {r.name} <span style={{ color: "var(--admin-faint)", fontSize: "0.75rem" }}>({r.roleLabel})</span>
                  </span>
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
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <Avatar name={c.otherName} photoUrl={c.otherPhotoUrl} size={36} />
                <div style={{ minWidth: 0, flex: 1 }}>
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
                </div>
              </div>
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
              <Avatar name={selected.name} photoUrl={selected.photoUrl} size={36} />
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--admin-text)" }}>{selected.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>{selected.roleLabel}</div>
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
                        {m.audio_url && <audio controls src={m.audio_url} style={{ maxWidth: "220px", height: "2.25rem" }} />}
                        {m.body && (
                          <div
                            style={{ fontSize: "0.875rem", wordBreak: "break-word", marginTop: m.audio_url ? "0.375rem" : 0 }}
                            dangerouslySetInnerHTML={{ __html: renderChatText(m.body) }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: "0.625rem 1rem 0.875rem", borderTop: "1px solid var(--admin-border)", flexShrink: 0 }}>
              {recording ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.25rem" }}>
                  <span style={{ width: "0.625rem", height: "0.625rem", borderRadius: "50%", backgroundColor: "#dc2626", flexShrink: 0 }} className="messages-rec-dot" />
                  <span style={{ fontSize: "0.875rem", color: "var(--admin-text)", flex: 1 }}>
                    Gravando... {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:{String(recordSeconds % 60).padStart(2, "0")}
                  </span>
                  <button type="button" onClick={cancelRecording} title="Cancelar" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-faint)", display: "flex" }}>
                    <X size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={finishRecording}
                    title="Enviar áudio"
                    style={{ backgroundColor: "#315E9C", color: "white", border: "none", borderRadius: "50%", width: "2.25rem", height: "2.25rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                  >
                    <Square size={14} fill="white" />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.375rem" }}>
                    <button type="button" onClick={() => applyFormat("**")} title="Negrito" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-faint)", padding: "0.25rem", display: "flex" }}>
                      <Bold size={15} />
                    </button>
                    <button type="button" onClick={() => applyFormat("_")} title="Itálico" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-faint)", padding: "0.25rem", display: "flex" }}>
                      <Italic size={15} />
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-end" }}>
                    <textarea
                      ref={textareaRef}
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
                    {text.trim() ? (
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={sending}
                        style={{ backgroundColor: "#315E9C", color: "white", border: "none", borderRadius: "0.5rem", width: "2.5rem", height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: sending ? "default" : "pointer", opacity: sending ? 0.6 : 1, flexShrink: 0 }}
                      >
                        <Send size={17} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecording}
                        disabled={uploadingAudio}
                        title="Gravar áudio"
                        style={{ backgroundColor: "#315E9C", color: "white", border: "none", borderRadius: "0.5rem", width: "2.5rem", height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: uploadingAudio ? "default" : "pointer", opacity: uploadingAudio ? 0.6 : 1, flexShrink: 0 }}
                      >
                        <Mic size={17} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .messages-list-pane { width: 100% !important; border-right: none !important; }
          .messages-back-btn { display: flex !important; }
        }
        .messages-rec-dot { animation: messages-rec-pulse 1.2s ease-in-out infinite; }
        @keyframes messages-rec-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}
