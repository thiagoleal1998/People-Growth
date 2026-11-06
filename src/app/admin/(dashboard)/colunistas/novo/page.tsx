import { createClient } from "@/lib/supabase/server";
import { ColumnistForm } from "../ColumnistForm";
import type { Columnist } from "@/types/database.types";

export default async function NovoColunistaPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allColumnists } = await (supabase as any).from("columnists").select("*").order("name");
  return <ColumnistForm allColumnists={(allColumnists ?? []) as Columnist[]} />;
}
