import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientForm } from "../ClientForm";
import type { FinanceClient } from "@/types/database.types";

export default async function EditFinanceClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("finance_clients").select("*").eq("id", id).single();
  if (!data) notFound();
  return <ClientForm item={data as FinanceClient} />;
}
