import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthorForm } from "../AuthorForm";
import type { Author } from "@/types/database.types";

export default async function EditarAutorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imageError?: string }>;
}) {
  const { id } = await params;
  const { imageError } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any).from("authors").select("*").eq("id", id).single();

  if (!item) notFound();

  return <AuthorForm item={item as Author} imageError={imageError} />;
}
