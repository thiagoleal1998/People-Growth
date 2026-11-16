import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { getCurrentProfile, isCurrentUserFounder } from "@/lib/auth/profile";
import { EmpresaTabs } from "./EmpresaTabs";
import type { Columnist, RoleProfile, CareerPlan } from "@/types/database.types";

export default async function EmpresaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; saved?: string }>;
}) {
  const { tab, saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [profile, { data: columnistsData }, { data: roleProfilesData }] = await Promise.all([
    getCurrentProfile(),
    client.from("columnists").select("*").order("order"),
    client.from("role_profiles").select("*").order("order"),
  ]);
  const columnists = (columnistsData ?? []) as Columnist[];
  const roleProfiles = (roleProfilesData ?? []) as RoleProfile[];

  // The RH tab (gender indices + career plans) is for founders only — a
  // non-founder admin never even gets the career_plans query run for them.
  const canViewRH = await isCurrentUserFounder(profile);
  const careerPlans = canViewRH ? ((await client.from("career_plans").select("*")).data as CareerPlan[] ?? []) : [];

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="A empresa" subtitle="Como o Grupo Festina é organizado." />
      <EmpresaTabs columnists={columnists} roleProfiles={roleProfiles} careerPlans={careerPlans} canViewRH={canViewRH} initialTab={tab} />
    </div>
  );
}
