import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleProfileForm } from "../../RoleProfileForm";
import type { Columnist, RoleProfile } from "@/types/database.types";

export default async function EditarCargoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: item }, { data: columnists }] = await Promise.all([
    client.from("role_profiles").select("*").eq("id", id).single(),
    client.from("columnists").select("*").order("name"),
  ]);

  if (!item) notFound();

  return <RoleProfileForm item={item as RoleProfile} columnists={(columnists ?? []) as Columnist[]} />;
}
