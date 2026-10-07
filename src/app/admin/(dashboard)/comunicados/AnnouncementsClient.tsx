"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/admin/ui";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "./actions";
import type { Announcement } from "@/types/database.types";

function formatDate(iso: string) {
  // timeZone pinned — see ArticlesTabs.tsx for why.
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function AnnouncementRow({ item, onSaved, onDeleted }: { item: Announcement; onSaved: (a: Announcement) => void; onDeleted: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div style={{ padding: "1.125rem 1.25rem", borderTop: "1px solid var(--admin-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--admin-text)" }}>{item.title}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.125rem" }}>{formatDate(item.created_at)}</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
            <button type="button" onClick={() => setEditing(true)} style={{ padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}>
              Editar
            </button>
            <ConfirmDeleteButton confirmText={`Excluir o comunicado "${item.title}"? Some para todo mundo, inclusive de quem já leu.`} onDelete={async () => { await deleteAnnouncement(item.id, item.title); onDeleted(); }} />
          </div>
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", marginTop: "0.625rem", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{item.body}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.125rem 1.25rem", borderTop: "1px solid var(--admin-border)" }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", fontWeight: 700, backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", marginBottom: "0.625rem" }} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", resize: "vertical" }} />
      {error && <div style={{ color: "#dc2626", fontSize: "0.8125rem", marginTop: "0.5rem" }}>{error}</div>}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.625rem" }}>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                await updateAnnouncement(item.id, title, body);
                onSaved({ ...item, title: title.trim(), body: body.trim() });
                setEditing(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao salvar.");
              }
            });
          }}
          style={{ backgroundColor: "#4361EE", color: "white", padding: "0.4rem 0.875rem", borderRadius: "0.375rem", fontWeight: 700, fontSize: "0.8125rem", border: "none", cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={() => { setEditing(false); setTitle(item.title); setBody(item.body); setError(null); }} style={{ backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", padding: "0.4rem 0.875rem", borderRadius: "0.375rem", fontWeight: 700, fontSize: "0.8125rem", border: "1px solid var(--admin-border-strong)", cursor: "pointer" }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function AnnouncementsClient({ announcements }: { announcements: Announcement[] }) {
  const [items, setItems] = useState(announcements);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function send() {
    setError(null);
    startTransition(async () => {
      try {
        const created = await createAnnouncement(title, body);
        setItems((prev) => [created, ...prev]);
        setTitle("");
        setBody("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar.");
      }
    });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: "1.5rem", alignItems: "start" }} className="announcements-grid">
      <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.25rem" }}>Novo comunicado</h2>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text-secondary)", marginBottom: "0.375rem" }}>Título</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Mudança no prazo de pauta" style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", marginBottom: "1rem" }} />
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text-secondary)", marginBottom: "0.375rem" }}>Mensagem</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="O que os autores precisam saber." style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", resize: "vertical", marginBottom: "1rem" }} />
        {error && <div style={{ color: "#dc2626", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{error}</div>}
        <button
          type="button"
          disabled={pending || !title.trim() || !body.trim()}
          onClick={send}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#4361EE", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: pending || !title.trim() || !body.trim() ? "default" : "pointer", opacity: pending || !title.trim() || !body.trim() ? 0.6 : 1 }}
        >
          <Send size={15} /> {pending ? "Enviando..." : "Enviar a todos os autores"}
        </button>
      </div>

      <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
        {items.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.9rem" }}>Nenhum comunicado enviado ainda.</div>
        ) : (
          items.map((item) => (
            <AnnouncementRow
              key={item.id}
              item={item}
              onSaved={(updated) => setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))}
              onDeleted={() => setItems((prev) => prev.filter((a) => a.id !== item.id))}
            />
          ))
        )}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .announcements-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
