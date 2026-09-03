import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { AuthorArticleForm } from "../AuthorArticleForm";
import type { Article, Category } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function EditarArtigoAutorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imageError?: string }>;
}) {
  const { id } = await params;
  const { imageError } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile?.author_id) notFound();

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: item }, { data: categoriesData }] = await Promise.all([
    client.from("articles").select("*").eq("id", id).eq("author_id", profile.author_id).single(),
    client.from("categories").select("*").order("name_pt"),
  ]);

  if (!item) notFound();

  return <AuthorArticleForm item={item as Article} categories={(categoriesData ?? []) as Category[]} imageError={imageError} />;
}
