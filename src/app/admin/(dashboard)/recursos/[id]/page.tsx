import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResourceForm } from "../ResourceForm";
import type { Resource } from "@/types/database.types";

export default async function EditarRecursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any).from("resources").select("*").eq("id", id).single();

  if (!item) notFound();

  return <ResourceForm item={item as Resource} />;
}
