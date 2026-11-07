import Link from "next/link";
import type { CSSProperties } from "react";
import { Plus, Edit, Eye } from "lucide-react";
import { Card, EmptyState, PrimaryLinkButton, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { deleteInstitutionalPost } from "./actions";
import type { InstitutionalPost } from "@/types/database.types";

const CELL_STYLE: CSSProperties = { padding: "0.875rem 1rem", verticalAlign: "middle", fontSize: "0.8125rem", color: "var(--admin-text-secondary)" };
const HEADER_STYLE: CSSProperties = { padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" };

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function InstitutionalPostsTable({ posts, columnistNameById }: { posts: InstitutionalPost[]; columnistNameById: Map<string, string> }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <PrimaryLinkButton href="/admin/institucional/novo">
          <Plus size={16} /> Novo post institucional
        </PrimaryLinkButton>
      </div>
      <Card>
        {posts.length === 0 ? (
          <EmptyState text="Nenhum post institucional cadastrado ainda." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  {["Título", "Assinado por", "Status", "Publicado em", ""].map((h) => (
                    <th key={h} style={HEADER_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <td style={{ ...CELL_STYLE, fontWeight: 700, color: "var(--admin-text)", minWidth: "220px" }}>{p.title_pt}</td>
                    <td style={CELL_STYLE}>{p.author_columnist_id ? columnistNameById.get(p.author_columnist_id) ?? "—" : "Grupo Festina"}</td>
                    <td style={CELL_STYLE}>
                      <Badge tone={p.status === "published" ? "success" : "neutral"}>{p.status === "published" ? "Publicado" : "Rascunho"}</Badge>
                    </td>
                    <td style={CELL_STYLE}>{formatDate(p.published_at)}</td>
                    <td style={{ ...CELL_STYLE, minWidth: "auto" }}>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <Link href={`/admin/institucional/${p.id}/preview`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Pré-visualizar">
                          <Eye size={15} />
                        </Link>
                        <Link href={`/admin/institucional/${p.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Editar">
                          <Edit size={15} />
                        </Link>
                        <ConfirmDeleteButton confirmText={`Excluir o post "${p.title_pt}"?`} onDelete={deleteInstitutionalPost.bind(null, p.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
