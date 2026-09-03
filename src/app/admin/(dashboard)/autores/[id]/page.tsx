import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthorForm } from "../AuthorForm";
import type { Author } from "@/types/database.types";

export default async function EditarAutorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any).from("authors").select("*").eq("id", id).single();

  if (!item) notFound();

  return <AuthorForm item={item as Author} />;
}
