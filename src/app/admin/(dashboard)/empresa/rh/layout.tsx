import { getCurrentProfile, requireFounder } from "@/lib/auth/profile";

// Gates every /admin/empresa/rh/* route to founders only — RLS on
// career_plans enforces the same thing at the data layer (same shape as
// financeiro/layout.tsx), but this turns a silent empty page into an
// actual 404 for anyone who isn't supposed to see this section exists.
export default async function EmpresaRHLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  await requireFounder(profile);
  return <>{children}</>;
}
