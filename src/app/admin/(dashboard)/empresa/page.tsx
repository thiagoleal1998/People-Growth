import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { EmpresaTabs } from "./EmpresaTabs";
import type { Columnist, RoleProfile } from "@/types/database.types";

export default async function EmpresaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; saved?: string }>;
}) {
  const { tab, saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: columnistsData }, { data: roleProfilesData }] = await Promise.all([
    client.from("columnists").select("*").order("order"),
    client.from("role_profiles").select("*").order("order"),
  ]);
  const columnists = (columnistsData ?? []) as Columnist[];
  const roleProfiles = (roleProfilesData ?? []) as RoleProfile[];

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="A empresa" subtitle="Como o Grupo Festina é organizado." />
      <EmpresaTabs columnists={columnists} roleProfiles={roleProfiles} initialTab={tab} />
    </div>
  );
}
