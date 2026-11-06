"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Edit, Eye, Check, MessageSquareWarning, Search } from "lucide-react";
import { Card, EmptyState, Badge, ConfirmDeleteButton, Input, Select } from "@/components/admin/ui";
import { deleteArticle, publishArticle, approveAndSchedule, setHomeSlot } from "./actions";
import type { Article } from "@/types/database.types";

const statusConfig: Record<Article["status"], { label: string; tone: "success" | "warning" | "neutral" }> = {
  draft: { label: "Rascunho", tone: "neutral" },
  pending: { label: "Pendente", tone: "warning" },
  scheduled: { label: "Agendado", tone: "warning" },
  published: { label: "Publicado", tone: "success" },
};

const formatConfig: Record<Article["format"], { label: string; tone: "success" | "warning" | "neutral" }> = {
  noticia: { label: "Notícia", tone: "neutral" },
  analise: { label: "Análise", tone: "success" },
  opiniao: { label: "Mea Sententia", tone: "warning" },
};

function formatDate(iso: string) {
  // timeZone pinned — this runs inside a "use client" component that Next.js
  // both server-renders and hydrates; with none set, the date formats in
  // UTC on the server but the viewer's local timezone in the browser,
  // which can flip the calendar day and throw a real hydration mismatch.
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

const tabs = [
  { id: "published", label: "Publicados" },
  { id: "mine", label: "Meus artigos" },
  { id: "draft", label: "Rascunhos" },
  { id: "pending", label: "Aguardando aprovação" },
  { id: "scheduled", label: "Agendados" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function homeSlotLabel(slot: string | null | undefined): string {
  switch (slot) {
    case "principal": return "Principal";
    case "secundario_1": return "Secundário 1";
    case "secundario_2": return "Secundário 2";
    case "secundario_3": return "Secundário 3";
    default: return "Automática";
  }
}

export function ArticlesTabs({
  articles,
  currentColumnistId,
  columnists,
}: {
  articles: Article[];
  currentColumnistId: string | null;
  columnists: { id: string; name: string }[];
}) {
  const [active, setActive] = useState<TabId>("published");
  const [search, setSearch] = useState("");
  const [columnistFilter, setColumnistFilter] = useState("");

  const columnistName = useMemo(() => new Map(columnists.map((c) => [c.id, c.name])), [columnists]);

  // Counts next to each tab label stay off the search/columnist filters —
  // they're the tab's own total, same as before this was added, not "how
  // many match the current search".
  const byTab = articles.filter((a) => {
    if (active === "published") return a.status === "published";
    if (active === "draft") return a.status === "draft";
    if (active === "pending") return a.status === "pending";
    if (active === "scheduled") return a.status === "scheduled";
    return currentColumnistId != null && a.columnist_id === currentColumnistId;
  });

  const trimmedSearch = search.trim().toLowerCase();
  const filtered = byTab.filter((a) => {
    if (trimmedSearch && !a.title_pt.toLowerCase().includes(trimmedSearch)) return false;
    if (columnistFilter && a.columnist_id !== columnistFilter) return false;
    return true;
  });

  const counts: Record<TabId, number> = {
    published: articles.filter((a) => a.status === "published").length,
    mine: currentColumnistId ? articles.filter((a) => a.columnist_id === currentColumnistId).length : 0,
    draft: articles.filter((a) => a.status === "draft").length,
    pending: articles.filter((a) => a.status === "pending").length,
    scheduled: articles.filter((a) => a.status === "scheduled").length,
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
              color: active === tab.id ? "#315E9C" : "var(--admin-muted)",
              background: "none",
              border: "none",
              borderBottom: active === tab.id ? "2px solid #315E9C" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label} ({counts[tab.id]})
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
          <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-faint)" }} />
          <Input
            type="search"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>
        <Select value={columnistFilter} onChange={(e) => setColumnistFilter(e.target.value)} style={{ flex: "0 1 220px" }}>
          <option value="">Todos os colunistas</option>
          {columnists.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text={search || columnistFilter ? "Nenhum artigo encontrado com esses filtros." : "Nenhum artigo nesta categoria."} />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                {["Título", "Colunista", "Formato", "Status", "Visualizações", "Posição na home", "Data", ""].map((h) => (
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
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                    {a.columnist_id ? (columnistName.get(a.columnist_id) ?? "—") : "—"}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={formatConfig[a.format].tone}>{formatConfig[a.format].label}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={statusConfig[a.status].tone}>{statusConfig[a.status].label}</Badge>
                    {(a.status === "pending" || a.status === "scheduled") && a.scheduled_for && (
                      <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.25rem" }}>
                        {a.status === "scheduled" ? "Vai ao ar em " : "Data pedida: "}
                        {formatDateTime(a.scheduled_for)}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{a.views.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.8125rem" }}>
                    {/* Changing the select saves straight away: the home slot can be set without opening the article. */}
                    <form action={setHomeSlot} style={{ margin: 0 }}>
                      <input type="hidden" name="id" value={a.id} />
                      <select
                        name="home_slot"
                        defaultValue={a.home_slot ?? ""}
                        aria-label={`Posição na home de ${a.title_pt}`}
                        onChange={(event) => event.currentTarget.form?.requestSubmit()}
                        style={{ padding: "0.3rem 0.5rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border)", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", fontSize: "0.8125rem" }}
                      >
                        <option value="">{homeSlotLabel(null)}</option>
                        <option value="principal">Principal</option>
                        <option value="secundario_1">Secundário 1</option>
                        <option value="secundario_2">Secundário 2</option>
                        <option value="secundario_3">Secundário 3</option>
                      </select>
                    </form>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.8125rem" }}>{formatDate(a.created_at)}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {a.status === "pending" && a.scheduled_for && (
                        <form action={approveAndSchedule.bind(null, a.id)}>
                          <button
                            type="submit"
                            title="Aprovar e agendar para a data pedida"
                            style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.5rem", color: "#b45309", backgroundColor: "rgba(217,119,6,0.1)", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            <Check size={13} /> Aprovar e agendar
                          </button>
                        </form>
                      )}
                      {(a.status === "pending" || a.status === "scheduled") && (
                        <form action={publishArticle.bind(null, a.id)}>
                          <button
                            type="submit"
                            title="Publicar agora"
                            style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.5rem", color: "#A07B3B", backgroundColor: "rgba(200, 154, 74,0.1)", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            <Check size={13} /> {a.status === "scheduled" ? "Publicar agora" : "Aprovar"}
                          </button>
                        </form>
                      )}
                      {a.status === "pending" ? (
                        <Link
                          href={`/admin/artigos/${a.id}/revisar`}
                          title="Ler o artigo, comentar trechos e aprovar ou pedir alterações"
                          style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.5rem", color: "#dc2626", backgroundColor: "rgba(239,68,68,0.1)", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none" }}
                        >
                          <MessageSquareWarning size={13} /> Revisar
                        </Link>
                      ) : (
                        <Link href={`/admin/artigos/${a.id}/preview`} target="_blank" style={{ padding: "0.375rem", color: "var(--admin-muted)", borderRadius: "0.375rem" }} title="Ler o artigo"><Eye size={15} /></Link>
                      )}
                      <Link href={`/admin/artigos/${a.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
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
