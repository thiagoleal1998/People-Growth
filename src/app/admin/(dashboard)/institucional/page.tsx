import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { InstitutionalPostsTable } from "./InstitutionalPostsTable";
import type { Columnist, InstitutionalPost } from "@/types/database.types";

export default async function InstitucionalAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: postsData }, { data: columnistsData }, { data: authorsData }] = await Promise.all([
    client.from("institutional_posts").select("*").order("created_at", { ascending: false }),
    client.from("columnists").select("*").order("name"),
    client.from("institutional_post_authors").select("post_id, columnist_id"),
  ]);
  const posts = (postsData ?? []) as InstitutionalPost[];
  const columnists = (columnistsData ?? []) as Columnist[];
  const columnistNameById = new Map(columnists.map((c) => [c.id, c.name]));
  const authorIdsByPost = new Map<string, string[]>();
  for (const a of (authorsData ?? []) as { post_id: string; columnist_id: string }[]) {
    authorIdsByPost.set(a.post_id, [...(authorIdsByPost.get(a.post_id) ?? []), a.columnist_id]);
  }

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Institucional" subtitle="Cartas ao leitor, comunicados oficiais e posicionamentos do Grupo Festina." />
      <InstitutionalPostsTable posts={posts} columnistNameById={columnistNameById} authorIdsByPost={authorIdsByPost} />
    </div>
  );
}
