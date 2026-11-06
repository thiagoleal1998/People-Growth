import { createClient } from "@/lib/supabase/server";
import { RoleProfileForm } from "../../RoleProfileForm";
import type { Columnist } from "@/types/database.types";

export default async function NovoCargoPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("columnists").select("*").order("name");
  return <RoleProfileForm columnists={(data ?? []) as Columnist[]} />;
}
