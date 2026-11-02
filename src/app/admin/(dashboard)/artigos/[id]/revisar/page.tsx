import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleReview } from "./ArticleReview";
import type { Article, Columnist, Category } from "@/types/database.types";

export default async function AdminArticleReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: article } = await client.from("articles").select("*").eq("id", id).single();
  if (!article) notFound();

  const [{ data: columnist }, { data: category }, { data: coauthorRows }] = await Promise.all([
    article.columnist_id ? client.from("columnists").select("*").eq("id", article.columnist_id).single() : Promise.resolve({ data: null }),
    article.category_id ? client.from("categories").select("*").eq("id", article.category_id).single() : Promise.resolve({ data: null }),
    client.from("article_coauthors").select("columnist_id, columnists(*)").eq("article_id", id),
  ]);
  const coauthors = ((coauthorRows ?? []) as { columnists: Columnist | null }[]).map((row) => row.columnists).filter((a): a is Columnist => Boolean(a));

  return <ArticleReview article={article as Article} columnist={(columnist as Columnist) ?? null} coauthors={coauthors} category={(category as Category) ?? null} />;
}
