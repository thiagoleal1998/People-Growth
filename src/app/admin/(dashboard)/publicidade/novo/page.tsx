import { createClient } from "@/lib/supabase/server";
import { AdForm } from "../AdForm";
import type { Article } from "@/types/database.types";

export default async function NovoAnuncioPage({ searchParams }: { searchParams: Promise<{ imageError?: string }> }) {
  const { imageError } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("articles").select("id, title_pt").order("created_at", { ascending: false });
  const articles = (data ?? []) as Pick<Article, "id" | "title_pt">[];

  return <AdForm articles={articles} targetedArticleIds={[]} imageError={imageError} />;
}
