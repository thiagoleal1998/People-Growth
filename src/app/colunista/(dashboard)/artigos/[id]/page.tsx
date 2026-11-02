import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { ColumnistArticleForm } from "../ColumnistArticleForm";
import type { Article, Columnist, Category } from "@/types/database.types";

export default async function EditarArtigoColunistaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imageError?: string; saveError?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { imageError, saveError, saved } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile?.columnist_id) notFound();

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: item }, { data: categoriesData }, { data: extraCategoriesData }, { data: coauthorsData }, { data: otherColumnistsData }] = await Promise.all([
    client.from("articles").select("*").eq("id", id).eq("columnist_id", profile.columnist_id).single(),
    client.from("categories").select("*").order("name_pt"),
    client.from("article_categories").select("category_id").eq("article_id", id),
    client.from("article_coauthors").select("columnist_id").eq("article_id", id),
    client.from("columnists").select("*").neq("id", profile.columnist_id).order("name"),
  ]);

  if (!item) notFound();

  return (
    <ColumnistArticleForm
      item={item as Article}
      categories={(categoriesData ?? []) as Category[]}
      otherColumnists={(otherColumnistsData ?? []) as Columnist[]}
      extraCategoryIds={((extraCategoriesData ?? []) as { category_id: string }[]).map((row) => row.category_id)}
      coauthorIds={((coauthorsData ?? []) as { columnist_id: string }[]).map((row) => row.columnist_id)}
      imageError={imageError}
      saveError={saveError}
      saved={saved === "1"}
    />
  );
}
