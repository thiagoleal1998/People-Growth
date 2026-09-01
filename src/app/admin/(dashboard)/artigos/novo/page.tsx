import { createClient } from "@/lib/supabase/server";
import { ArticleForm } from "../ArticleForm";
import type { Category, Author } from "@/types/database.types";

export default async function NovoArtigoPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: categoriesData }, { data: authorsData }] = await Promise.all([
    client.from("categories").select("*").order("name_pt"),
    client.from("authors").select("*").order("name"),
  ]);

  return <ArticleForm categories={(categoriesData ?? []) as Category[]} authors={(authorsData ?? []) as Author[]} />;
}
