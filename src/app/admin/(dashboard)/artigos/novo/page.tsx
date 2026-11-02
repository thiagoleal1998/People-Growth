import { createClient } from "@/lib/supabase/server";
import { ArticleForm } from "../ArticleForm";
import type { Category, Columnist } from "@/types/database.types";

export default async function NovoArtigoPage({
  searchParams,
}: {
  searchParams: Promise<{ saveError?: string }>;
}) {
  const { saveError } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: categoriesData }, { data: columnistsData }] = await Promise.all([
    client.from("categories").select("*").order("name_pt"),
    client.from("columnists").select("*").order("name"),
  ]);

  return <ArticleForm categories={(categoriesData ?? []) as Category[]} columnists={(columnistsData ?? []) as Columnist[]} saveError={saveError} />;
}
