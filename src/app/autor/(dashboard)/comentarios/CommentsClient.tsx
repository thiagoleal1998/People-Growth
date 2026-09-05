"use client";

import { useState, useTransition } from "react";
import { Trash2, Flag, CornerDownRight } from "lucide-react";
import type { Comment } from "@/types/database.types";
import { RejectCommentModal } from "@/components/admin/RejectCommentModal";
import { updateCommentStatus, deleteComment } from "./actions";

const statusConfig: Record<Comment["status"], { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente", color: "#cc9200", bg: "rgba(255,183,3,0.1)" },
  approved: { label: "Aprovado", color: "#04a87d", bg: "rgba(6,214,160,0.1)" },
  rejected: { label: "Rejeitado", color: "#dc2626", bg: "rgba(239,68,68,0.1)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export function CommentsClient({
  comments,
  articleTitles,
}: {
  comments: Comment[];
  articleTitles: Record<string, string>;
}) {
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(comments);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const rejecting = items.find((i) => i.id === rejectingId) ?? null;

  function confirmReject(reason: string) {
    if (!rejectingId) return;
    const id = rejectingId;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "rejected", rejection_reason: reason || null } : i)));
    startTransition(() => updateCommentStatus(id, "rejected", reason));
    setRejectingId(null);
  }

  return (
    <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid #f1f5f9", overflow: "hidden" }}>
      {items.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>
          Nenhum comentário nos seus artigos ainda.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Artigo", "Comentário", "Nome", "Denúncias", "Status", "Data", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const s = statusConfig[c.status];
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.875rem 1.25rem", color: "#0d1b2a", fontSize: "0.8125rem", maxWidth: "200px" }}>
                      <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {articleTitles[c.article_id] ?? "—"}
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "#475569", fontSize: "0.875rem", maxWidth: "360px" }}>
                      {c.parent_id && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                          <CornerDownRight size={11} /> resposta
                        </span>
                      )}
                      <div>{c.body}</div>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "#0d1b2a", fontSize: "0.875rem", fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      {c.reports > 0 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#dc2626", backgroundColor: "rgba(239,68,68,0.1)", padding: "0.2rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700 }}>
                          <Flag size={11} /> {c.reports}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "0.8125rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <select
                        value={c.status}
                        onChange={(e) => {
                          const status = e.target.value as Comment["status"];
                          if (status === "rejected") {
                            setRejectingId(c.id);
                            return;
                          }
                          setItems((prev) => prev.map((i) => (i.id === c.id ? { ...i, status, rejection_reason: null } : i)));
                          startTransition(() => updateCommentStatus(c.id, status));
                        }}
                        style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}
                      >
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                      {c.status === "rejected" && c.rejection_reason && (
                        <div style={{ marginTop: "0.375rem", fontSize: "0.75rem", color: "#94a3b8", maxWidth: "180px" }} title={c.rejection_reason}>
                          {c.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{formatDate(c.created_at)}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir o comentário de ${c.name}?`)) {
                            setItems((prev) => prev.filter((i) => i.id !== c.id));
                            startTransition(() => deleteComment(c.id));
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
      {rejecting && (
        <RejectCommentModal
          commenterName={rejecting.name}
          pending={pending}
          onCancel={() => setRejectingId(null)}
          onConfirm={confirmReject}
        />
      )}
    </div>
  );
}
