import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader, PrimaryLinkButton } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { ArtigosComentariosTabs } from "./ArtigosComentariosTabs";
import type { Article, Comment } from "@/types/database.types";

export default async function ArtigosAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; tab?: string }> }) {
  const { saved, tab } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data }, profile, { data: commentsData }, { data: articlesForTitles }] = await Promise.all([
    client.from("articles").select("*").order("created_at", { ascending: false }),
    getCurrentProfile(),
    client.from("comments").select("*").order("created_at", { ascending: false }),
    client.from("articles").select("id,title_pt"),
  ]);
  const articles = (data ?? []) as Article[];
  const comments = (commentsData ?? []) as Comment[];
  const articleTitles = Object.fromEntries(
    ((articlesForTitles ?? []) as Pick<Article, "id" | "title_pt">[]).map((a) => [a.id, a.title_pt])
  );

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader
        title="Artigos"
        subtitle={`${articles.length} artigo${articles.length === 1 ? "" : "s"} · ${comments.length} comentário${comments.length === 1 ? "" : "s"}`}
        action={<PrimaryLinkButton href="/admin/artigos/novo"><Plus size={16} /> Novo artigo</PrimaryLinkButton>}
      />

      <ArtigosComentariosTabs
        articles={articles}
        currentAuthorId={profile?.author_id ?? null}
        comments={comments}
        articleTitles={articleTitles}
        initialTab={tab}
      />
    </div>
  );
}
