import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { CommentsClient } from "./CommentsClient";
import type { Comment, Article } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ComentariosPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: commentsData }, { data: articlesData }] = await Promise.all([
    client.from("comments").select("*").order("created_at", { ascending: false }),
    client.from("articles").select("id,title_pt"),
  ]);

  const comments = (commentsData ?? []) as Comment[];
  const articleTitles = Object.fromEntries(
    ((articlesData ?? []) as Pick<Article, "id" | "title_pt">[]).map((a) => [a.id, a.title_pt])
  );
  const pendingCount = comments.filter((c) => c.status === "pending").length;

  return (
    <div>
      <PageHeader
        title="Comentários"
        subtitle={`${comments.length} comentário${comments.length === 1 ? "" : "s"}${pendingCount > 0 ? ` · ${pendingCount} pendente${pendingCount === 1 ? "" : "s"} de aprovação` : ""}`}
      />
      <CommentsClient comments={comments} articleTitles={articleTitles} />
    </div>
  );
}
