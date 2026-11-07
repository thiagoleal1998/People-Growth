import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InstitutionalPostForm } from "../InstitutionalPostForm";
import type { Columnist, InstitutionalPost } from "@/types/database.types";

export default async function EditarPostInstitucionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: item }, { data: columnistsData }, { data: authorsData }] = await Promise.all([
    client.from("institutional_posts").select("*").eq("id", id).single(),
    client.from("columnists").select("*").order("name"),
    client.from("institutional_post_authors").select("columnist_id").eq("post_id", id),
  ]);
  if (!item) notFound();
  const columnists = (columnistsData ?? []) as Columnist[];
  const authorIds = ((authorsData ?? []) as { columnist_id: string }[]).map((a) => a.columnist_id);

  return <InstitutionalPostForm item={item as InstitutionalPost} columnists={columnists} authorIds={authorIds} />;
}
