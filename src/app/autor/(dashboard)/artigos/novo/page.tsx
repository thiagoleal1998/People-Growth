import { createClient } from "@/lib/supabase/server";
import { AuthorArticleForm } from "../AuthorArticleForm";
import type { Category } from "@/types/database.types";

export default async function NovoArtigoAutorPage({
  searchParams,
}: {
  searchParams: Promise<{ saveError?: string }>;
}) {
  const { saveError } = await searchParams;
  const supabase = await createClient();
  const { data: categoriesData } = await supabase.from("categories").select("*").order("name_pt");

  return <AuthorArticleForm categories={(categoriesData ?? []) as Category[]} saveError={saveError} />;
}
