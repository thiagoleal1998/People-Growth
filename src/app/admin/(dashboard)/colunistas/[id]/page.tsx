import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ColumnistForm } from "../ColumnistForm";
import type { Columnist } from "@/types/database.types";

export default async function EditarColunistaPage({
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
  const { data: item } = await (supabase as any).from("columnists").select("*").eq("id", id).single();

  if (!item) notFound();

  return <ColumnistForm item={item as Columnist} imageError={imageError} />;
}
