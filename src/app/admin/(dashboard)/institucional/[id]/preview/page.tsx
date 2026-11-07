import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { InstitutionalPostView } from "@/components/InstitutionalPostView";
import type { Columnist, InstitutionalPost } from "@/types/database.types";

export default async function PreviewPostInstitucionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data } = await client.from("institutional_posts").select("*").eq("id", id).single();
  if (!data) notFound();
  const post = data as InstitutionalPost;
  const { data: authorRows } = await client.from("institutional_post_authors").select("columnist_id").eq("post_id", id);
  const authorIds = ((authorRows ?? []) as { columnist_id: string }[]).map((a) => a.columnist_id);
  const columnists =
    authorIds.length > 0 ? (((await client.from("columnists").select("*").in("id", authorIds)).data ?? []) as Columnist[]) : [];

  return (
    <div style={{ maxWidth: "820px" }}>
      <Link href="/admin/institucional" style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
        &larr; Voltar
      </Link>
      <InstitutionalPostView post={post} columnists={columnists} preview />
    </div>
  );
}
