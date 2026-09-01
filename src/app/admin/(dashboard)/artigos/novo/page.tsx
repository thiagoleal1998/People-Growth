import { createClient } from "@/lib/supabase/server";
import { ArticleForm } from "../ArticleForm";
import type { Category } from "@/types/database.types";

export default async function NovoArtigoPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("categories").select("*").order("name_pt");
  const categories = (data ?? []) as Category[];

  return <ArticleForm categories={categories} />;
}
