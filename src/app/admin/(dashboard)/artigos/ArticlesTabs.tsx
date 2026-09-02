"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Check } from "lucide-react";
import { Card, EmptyState, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { deleteArticle, publishArticle } from "./actions";
import type { Article } from "@/types/database.types";

const statusConfig: Record<Article["status"], { label: string; tone: "success" | "warning" | "neutral" }> = {
  draft: { label: "Rascunho", tone: "neutral" },
  pending: { label: "Pendente", tone: "warning" },
  published: { label: "Publicado", tone: "success" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

const tabs = [
  { id: "published", label: "Publicados" },
  { id: "mine", label: "Meus artigos" },
  { id: "draft", label: "Rascunhos" },
  { id: "pending", label: "Aguardando aprovação" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ArticlesTabs({ articles, currentAuthorId }: { articles: Article[]; currentAuthorId: string | null }) {
  const [active, setActive] = useState<TabId>("published");

  const filtered = articles.filter((a) => {
    if (active === "published") return a.status === "published";
    if (active === "draft") return a.status === "draft";
    if (active === "pending") return a.status === "pending";
    return currentAuthorId != null && a.author_id === currentAuthorId;
  });

  const counts: Record<TabId, number> = {
    published: articles.filter((a) => a.status === "published").length,
    mine: currentAuthorId ? articles.filter((a) => a.author_id === currentAuthorId).length : 0,
    draft: articles.filter((a) => a.status === "draft").length,
    pending: articles.filter((a) => a.status === "pending").length,
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            style={{
              padding: "0.75rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: active === tab.id ? "#4361EE" : "var(--admin-muted)",
              background: "none",
              border: "none",
              borderBottom: active === tab.id ? "2px solid #4361EE" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label} ({counts[tab.id]})
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Nenhum artigo nesta categoria." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                {["Título", "Formato", "Status", "Visualizações", "Data", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem", maxWidth: "320px" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title_pt}</div>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={a.format === "opiniao" ? "warning" : "neutral"}>{a.format === "opiniao" ? "Mea Sententia" : "Notícia"}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={statusConfig[a.status].tone}>{statusConfig[a.status].label}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{a.views.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.8125rem" }}>{formatDate(a.created_at)}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {a.status === "pending" && (
                        <form action={publishArticle.bind(null, a.id)}>
                          <button
                            type="submit"
                            title="Aprovar e publicar"
                            style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.5rem", color: "#04a87d", backgroundColor: "rgba(6,214,160,0.1)", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            <Check size={13} /> Aprovar
                          </button>
                        </form>
                      )}
                      <Link href={`/admin/artigos/${a.id}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                      <ConfirmDeleteButton confirmText={`Excluir o artigo "${a.title_pt}"?`} onDelete={deleteArticle.bind(null, a.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
