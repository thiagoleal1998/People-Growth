import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { ColumnistArticleForm } from "../ColumnistArticleForm";
import type { Columnist, Category } from "@/types/database.types";

export default async function NovoArtigoColunistaPage({
  searchParams,
}: {
  searchParams: Promise<{ saveError?: string }>;
}) {
  const { saveError } = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: categoriesData }, { data: otherColumnistsData }] = await Promise.all([
    client.from("categories").select("*").order("name_pt"),
    profile?.columnist_id ? client.from("columnists").select("*").neq("id", profile.columnist_id).order("name") : client.from("columnists").select("*").order("name"),
  ]);

  return (
    <ColumnistArticleForm
      categories={(categoriesData ?? []) as Category[]}
      otherColumnists={(otherColumnistsData ?? []) as Columnist[]}
      saveError={saveError}
    />
  );
}
