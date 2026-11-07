import { createClient } from "@/lib/supabase/server";
import { InstitutionalPostForm } from "../InstitutionalPostForm";
import type { Columnist } from "@/types/database.types";

export default async function NovoPostInstitucionalPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("columnists").select("*").order("name");
  const columnists = (data ?? []) as Columnist[];

  return <InstitutionalPostForm columnists={columnists} />;
}
