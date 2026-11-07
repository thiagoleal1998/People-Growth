import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InstitutionalPostForm } from "../InstitutionalPostForm";
import type { Columnist, InstitutionalPost } from "@/types/database.types";

export default async function EditarPostInstitucionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: item }, { data: columnistsData }] = await Promise.all([
    client.from("institutional_posts").select("*").eq("id", id).single(),
    client.from("columnists").select("*").order("name"),
  ]);
  if (!item) notFound();
  const columnists = (columnistsData ?? []) as Columnist[];

  return <InstitutionalPostForm item={item as InstitutionalPost} columnists={columnists} />;
}
