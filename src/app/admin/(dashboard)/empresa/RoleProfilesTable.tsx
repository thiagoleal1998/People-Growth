import Link from "next/link";
import type { CSSProperties } from "react";
import { Plus, Edit } from "lucide-react";
import { Card, EmptyState, PrimaryLinkButton, ConfirmDeleteButton } from "@/components/admin/ui";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { deleteRoleProfile } from "./actions";
import type { RoleProfile } from "@/types/database.types";

const CELL_STYLE: CSSProperties = { padding: "0.875rem 1rem", verticalAlign: "top", fontSize: "0.8125rem", color: "var(--admin-text-secondary)", lineHeight: 1.5, minWidth: "220px" };
const HEADER_STYLE: CSSProperties = { padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" };

// Each responsibilities field is markdown-lite (same dialect as article
// bodies) — rendered the same way, so a bold sub-label inside a bullet
// point ("**Growth:** ...") works exactly like it does in an article.
function MarkdownCell({ text }: { text: string | null }) {
  if (!text) return <span style={{ color: "var(--admin-faint)" }}>—</span>;
  // eslint-disable-next-line react/no-danger
  return <div className="role-profile-cell" dangerouslySetInnerHTML={{ __html: renderMarkdownLite(text) }} />;
}

export function RoleProfilesTable({ profiles, columnistNameById }: { profiles: RoleProfile[]; columnistNameById: Map<string, string> }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <PrimaryLinkButton href="/admin/empresa/cargos/novo">
          <Plus size={16} /> Novo cargo
        </PrimaryLinkButton>
      </div>
      <Card>
        {profiles.length === 0 ? (
          <EmptyState text="Nenhum cargo cadastrado ainda." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  {["Sócio", "Sigla", "Significado", "Função", "Resp. Geral", "Resp. Primárias", "Resp. Secundárias", "Resp. Terciárias", ""].map((h) => (
                    <th key={h} style={HEADER_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <td style={{ ...CELL_STYLE, fontWeight: 800, color: "var(--admin-text)", minWidth: "140px" }}>
                      {p.columnist_id ? columnistNameById.get(p.columnist_id) ?? "—" : "—"}
                    </td>
                    <td style={{ ...CELL_STYLE, fontWeight: 700, color: "#315E9C", minWidth: "80px" }}>{p.acronym || "—"}</td>
                    <td style={{ ...CELL_STYLE, minWidth: "180px" }}>{p.title || "—"}</td>
                    <td style={CELL_STYLE}>{p.function_summary || "—"}</td>
                    <td style={CELL_STYLE}><MarkdownCell text={p.general_responsibilities} /></td>
                    <td style={CELL_STYLE}><MarkdownCell text={p.primary_responsibilities} /></td>
                    <td style={CELL_STYLE}><MarkdownCell text={p.secondary_responsibilities} /></td>
                    <td style={CELL_STYLE}><MarkdownCell text={p.tertiary_responsibilities} /></td>
                    <td style={{ ...CELL_STYLE, minWidth: "auto" }}>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <Link href={`/admin/empresa/cargos/${p.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Editar">
                          <Edit size={15} />
                        </Link>
                        <ConfirmDeleteButton confirmText={`Excluir o cargo de "${p.columnist_id ? columnistNameById.get(p.columnist_id) ?? "" : ""}"?`} onDelete={deleteRoleProfile.bind(null, p.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <style>{`
        .role-profile-cell p { margin: 0 0 0.5rem; }
        .role-profile-cell p:last-child { margin-bottom: 0; }
        .role-profile-cell ul { margin: 0; padding-left: 1.125rem; }
        .role-profile-cell li { margin-bottom: 0.375rem; }
        .role-profile-cell li:last-child { margin-bottom: 0; }
        .role-profile-cell strong { color: var(--admin-text); }
      `}</style>
    </div>
  );
}
