import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EntryForm } from "../EntryForm";
import type { FinanceClient, FinanceEntry } from "@/types/database.types";

export default async function EditFinanceEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: item }, { data: clientsData }, { data: categoryRows }] = await Promise.all([
    client.from("finance_entries").select("*").eq("id", id).single(),
    client.from("finance_clients").select("*").order("name"),
    client.from("finance_entries").select("category").not("category", "is", null),
  ]);
  if (!item) notFound();
  const categories = [...new Set(((categoryRows ?? []) as Pick<FinanceEntry, "category">[]).map((r) => r.category).filter((c): c is string => Boolean(c)))].sort((a, b) => a.localeCompare(b, "pt"));

  return <EntryForm item={item as FinanceEntry} clients={(clientsData ?? []) as FinanceClient[]} categories={categories} />;
}
