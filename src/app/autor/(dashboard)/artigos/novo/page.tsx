import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { AuthorArticleForm } from "../AuthorArticleForm";
import type { Author, Category } from "@/types/database.types";

export default async function NovoArtigoAutorPage({
  searchParams,
}: {
  searchParams: Promise<{ saveError?: string }>;
}) {
  const { saveError } = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: categoriesData }, { data: otherAuthorsData }] = await Promise.all([
    client.from("categories").select("*").order("name_pt"),
    profile?.author_id ? client.from("authors").select("*").neq("id", profile.author_id).order("name") : client.from("authors").select("*").order("name"),
  ]);

  return (
    <AuthorArticleForm
      categories={(categoriesData ?? []) as Category[]}
      otherAuthors={(otherAuthorsData ?? []) as Author[]}
      saveError={saveError}
    />
  );
}
