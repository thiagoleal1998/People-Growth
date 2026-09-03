import { createClient } from "@/lib/supabase/server";
import { AuthorArticleForm } from "../AuthorArticleForm";
import type { Category } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function NovoArtigoAutorPage() {
  const supabase = await createClient();
  const { data: categoriesData } = await supabase.from("categories").select("*").order("name_pt");

  return <AuthorArticleForm categories={(categoriesData ?? []) as Category[]} />;
}
