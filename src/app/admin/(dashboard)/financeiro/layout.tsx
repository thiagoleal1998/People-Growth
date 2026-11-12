import { getCurrentProfile, requireFounder } from "@/lib/auth/profile";

// Gates every /admin/financeiro/* route to C-level (founders) only — RLS on
// finance_clients/finance_entries enforces the same thing at the data
// layer, but this turns "silently empty page" into an actual 404 for
// anyone who isn't supposed to see this section exists at all.
export default async function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  await requireFounder(profile);
  return <>{children}</>;
}
