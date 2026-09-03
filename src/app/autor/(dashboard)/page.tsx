import Link from "next/link";
import { Plus, Edit, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader, PrimaryLinkButton, Card, EmptyState, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { deleteOwnArticle } from "./artigos/actions";
import type { Article } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const statusConfig: Record<Article["status"], { label: string; tone: "success" | "warning" | "neutral" }> = {
  draft: { label: "Rascunho", tone: "neutral" },
  pending: { label: "Em revisão", tone: "warning" },
  published: { label: "Publicado", tone: "success" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default async function AutorHomePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile?.author_id) {
    return (
      <div>
        <PageHeader title="Meus artigos" />
        <Card>
          <EmptyState text="Seu login ainda não está vinculado a um perfil de autor. Peça a um admin para vincular em Admin → Usuários." />
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("articles")
    .select("*")
    .eq("author_id", profile.author_id)
    .order("created_at", { ascending: false });
  const articles = (data ?? []) as Article[];

  const commentCounts = new Map<string, number>();
  if (articles.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: commentsData } = await (supabase as any)
      .from("comments")
      .select("article_id")
      .eq("status", "approved")
      .in("article_id", articles.map((a) => a.id));
    for (const c of (commentsData ?? []) as { article_id: string }[]) {
      commentCounts.set(c.article_id, (commentCounts.get(c.article_id) ?? 0) + 1);
    }
  }

  return (
    <div>
      <SavedToast show={saved === "1"} />
      {error && (
        <div style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "0.625rem", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          {error}
        </div>
      )}
      <PageHeader
        title="Meus artigos"
        subtitle={`${articles.length} artigo${articles.length === 1 ? "" : "s"}`}
        action={<PrimaryLinkButton href="/autor/artigos/novo"><Plus size={16} /> Novo artigo</PrimaryLinkButton>}
      />

      <Card>
        {articles.length === 0 ? (
          <EmptyState text="Você ainda não escreveu nenhum artigo." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Título", "Formato", "Status", "Visualizações", "Comentários", "Data", ""].map((h) => (
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
                    <Badge tone={statusConfig[a.status].tone}>{statusConfig[a.status].label}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "#475569", fontSize: "0.875rem" }}>{a.views.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "#475569", fontSize: "0.875rem" }}>{commentCounts.get(a.id) ?? 0}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.8125rem" }}>{formatDate(a.created_at)}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/autor/artigos/${a.id}/estatisticas`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Estatísticas"><BarChart3 size={15} /></Link>
                      <Link href={`/autor/artigos/${a.id}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                      {a.status !== "published" && (
                        <ConfirmDeleteButton confirmText={`Excluir o artigo "${a.title_pt}"?`} onDelete={deleteOwnArticle.bind(null, a.id)} />
                      )}
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
