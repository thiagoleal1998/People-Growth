import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleForm } from "../ArticleForm";
import type { Article, Category, Author } from "@/types/database.types";

export default async function EditarArtigoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: item }, { data: categoriesData }, { data: authorsData }] = await Promise.all([
    client.from("articles").select("*").eq("id", id).single(),
    client.from("categories").select("*").order("name_pt"),
    client.from("authors").select("*").order("name"),
  ]);

  if (!item) notFound();

  return <ArticleForm item={item as Article} categories={(categoriesData ?? []) as Category[]} authors={(authorsData ?? []) as Author[]} />;
}
