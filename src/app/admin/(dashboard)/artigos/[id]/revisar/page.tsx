import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleReview } from "./ArticleReview";
import type { Article, Author, Category } from "@/types/database.types";

export default async function AdminArticleReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: article } = await client.from("articles").select("*").eq("id", id).single();
  if (!article) notFound();

  const [{ data: author }, { data: category }] = await Promise.all([
    article.author_id ? client.from("authors").select("*").eq("id", article.author_id).single() : Promise.resolve({ data: null }),
    article.category_id ? client.from("categories").select("*").eq("id", article.category_id).single() : Promise.resolve({ data: null }),
  ]);

  return <ArticleReview article={article as Article} author={(author as Author) ?? null} category={(category as Category) ?? null} />;
}
