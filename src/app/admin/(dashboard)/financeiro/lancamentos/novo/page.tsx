import { createClient } from "@/lib/supabase/server";
import { EntryForm } from "../EntryForm";
import type { FinanceClient, FinanceEntry } from "@/types/database.types";

export default async function NovoFinanceEntryPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: clientsData }, { data: categoryRows }] = await Promise.all([
    client.from("finance_clients").select("*").order("name"),
    client.from("finance_entries").select("category").not("category", "is", null),
  ]);
  const categories = [...new Set(((categoryRows ?? []) as Pick<FinanceEntry, "category">[]).map((r) => r.category).filter((c): c is string => Boolean(c)))].sort((a, b) => a.localeCompare(b, "pt"));

  return <EntryForm clients={(clientsData ?? []) as FinanceClient[]} categories={categories} />;
}
