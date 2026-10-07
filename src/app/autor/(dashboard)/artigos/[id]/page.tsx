import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { AuthorArticleForm } from "../AuthorArticleForm";
import type { Article, Category } from "@/types/database.types";

export default async function EditarArtigoAutorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imageError?: string; saveError?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { imageError, saveError, saved } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile?.author_id) notFound();

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: item }, { data: categoriesData }, { data: extraCategoriesData }] = await Promise.all([
    client.from("articles").select("*").eq("id", id).eq("author_id", profile.author_id).single(),
    client.from("categories").select("*").order("name_pt"),
    client.from("article_categories").select("category_id").eq("article_id", id),
  ]);

  if (!item) notFound();

  return (
    <AuthorArticleForm
      item={item as Article}
      categories={(categoriesData ?? []) as Category[]}
      extraCategoryIds={((extraCategoriesData ?? []) as { category_id: string }[]).map((row) => row.category_id)}
      imageError={imageError}
      saveError={saveError}
      saved={saved === "1"}
    />
  );
}
