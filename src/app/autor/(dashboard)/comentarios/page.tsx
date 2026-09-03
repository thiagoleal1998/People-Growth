import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { CommentsClient } from "./CommentsClient";
import type { Article, Comment } from "@/types/database.types";

export default async function ComentariosAutorPage() {
  const profile = await getCurrentProfile();

  if (!profile?.author_id) {
    return (
      <div>
        <PageHeader title="Comentários" />
        <Card>
          <EmptyState text="Seu login ainda não está vinculado a um perfil de autor. Peça a um admin para vincular em Admin → Usuários." />
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: ownArticles } = await client.from("articles").select("id, title_pt").eq("author_id", profile.author_id);
  const articles = (ownArticles ?? []) as Pick<Article, "id" | "title_pt">[];
  const articleTitles = Object.fromEntries(articles.map((a) => [a.id, a.title_pt]));
  const articleIds = articles.map((a) => a.id);

  let comments: Comment[] = [];
  if (articleIds.length > 0) {
    const { data } = await client
      .from("comments")
      .select("*")
      .in("article_id", articleIds)
      .order("created_at", { ascending: false });
    comments = (data ?? []) as Comment[];
  }

  const pendingCount = comments.filter((c) => c.status === "pending").length;

  return (
    <div>
      <PageHeader
        title="Comentários"
        subtitle={`${comments.length} comentário${comments.length === 1 ? "" : "s"} nos seus artigos${pendingCount > 0 ? ` · ${pendingCount} pendente${pendingCount === 1 ? "" : "s"} de aprovação` : ""}`}
      />
      <CommentsClient comments={comments} articleTitles={articleTitles} />
    </div>
  );
}
