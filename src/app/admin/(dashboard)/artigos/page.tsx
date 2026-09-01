import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, PrimaryLinkButton, Card, EmptyState, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { deleteArticle } from "./actions";
import type { Article } from "@/types/database.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default async function ArtigosAdminPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("articles").select("*").order("created_at", { ascending: false });
  const articles = (data ?? []) as Article[];

  return (
    <div>
      <PageHeader
        title="Artigos"
        subtitle={`${articles.length} artigo${articles.length === 1 ? "" : "s"}`}
        action={<PrimaryLinkButton href="/admin/artigos/novo"><Plus size={16} /> Novo artigo</PrimaryLinkButton>}
      />

      <Card>
        {articles.length === 0 ? (
          <EmptyState text="Nenhum artigo cadastrado ainda." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Título", "Formato", "Status", "Visualizações", "Data", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "#0d1b2a", fontSize: "0.875rem", maxWidth: "320px" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title_pt}</div>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={a.format === "opiniao" ? "warning" : "neutral"}>{a.format === "opiniao" ? "Mea Sententia" : "Notícia"}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={a.status === "published" ? "success" : "neutral"}>{a.status === "published" ? "Publicado" : "Rascunho"}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>{a.views.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.8125rem" }}>{formatDate(a.created_at)}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
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
