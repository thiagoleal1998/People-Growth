import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleForm } from "../ArticleForm";
import type { Article, Category, Author } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function EditarArtigoPage({
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
  const [{ data: item }, { data: categoriesData }, { data: authorsData }] = await Promise.all([
    client.from("articles").select("*").eq("id", id).single(),
    client.from("categories").select("*").order("name_pt"),
    client.from("authors").select("*").order("name"),
  ]);

  if (!item) notFound();

  return (
    <ArticleForm
      item={item as Article}
      categories={(categoriesData ?? []) as Category[]}
      authors={(authorsData ?? []) as Author[]}
      imageError={imageError}
    />
  );
}
