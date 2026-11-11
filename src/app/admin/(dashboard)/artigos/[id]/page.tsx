import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleForm } from "../ArticleForm";
import type { Article, Category, Columnist } from "@/types/database.types";

export default async function EditarArtigoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imageError?: string; saveError?: string; saved?: string; tab?: string }>;
}) {
  const { id } = await params;
  const { imageError, saveError, saved, tab } = await searchParams;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: item }, { data: categoriesData }, { data: columnistsData }, { data: extraCategoriesData }, { data: cocolumnistsData }] = await Promise.all([
    client.from("articles").select("*").eq("id", id).single(),
    client.from("categories").select("*").order("name_pt"),
    client.from("columnists").select("*").order("name"),
    client.from("article_categories").select("category_id").eq("article_id", id),
    client.from("article_coauthors").select("columnist_id").eq("article_id", id),
  ]);

  if (!item) notFound();

  return (
    <ArticleForm
      item={item as Article}
      categories={(categoriesData ?? []) as Category[]}
      columnists={(columnistsData ?? []) as Columnist[]}
      extraCategoryIds={((extraCategoriesData ?? []) as { category_id: string }[]).map((row) => row.category_id)}
      coauthorIds={((cocolumnistsData ?? []) as { columnist_id: string }[]).map((row) => row.columnist_id)}
      imageError={imageError}
      saveError={saveError}
      saved={saved === "1"}
      initialTab={tab}
    />
  );
}
