import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdForm } from "../AdForm";
import type { Ad, Article } from "@/types/database.types";

export default async function EditarAnuncioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imageError?: string }>;
}) {
  const { id } = await params;
  const { imageError } = await searchParams;

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: adData }, { data: articlesData }, { data: targetsData }] = await Promise.all([
    client.from("ads").select("*").eq("id", id).single(),
    client.from("articles").select("id, title_pt").order("created_at", { ascending: false }),
    client.from("ad_targets").select("article_id").eq("ad_id", id),
  ]);

  const item = adData as Ad | null;
  if (!item) notFound();

  const articles = (articlesData ?? []) as Pick<Article, "id" | "title_pt">[];
  const targetedArticleIds = ((targetsData ?? []) as { article_id: string }[]).map((t) => t.article_id);

  return <AdForm item={item} articles={articles} targetedArticleIds={targetedArticleIds} imageError={imageError} />;
}
