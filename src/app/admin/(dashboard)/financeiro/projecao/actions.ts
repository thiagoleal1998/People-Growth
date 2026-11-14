"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";

// Fixed id: this is a singleton ("the current projection"), not a history
// of saved scenarios — every save overwrites the same row.
const PROJECTION_ID = "00000000-0000-0000-0000-000000000001";

export async function saveProjection(data: {
  revenue: number;
  expense: number;
  companyPct: number;
  partnersPct: number;
  payrollTaxPct: number;
  salaries: Record<string, number>;
  partnerShares: Record<string, number>;
  quickProfit: number;
  quickCosts: number;
  quickPartnersPct: number;
  quickTeamPct: number;
}) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  await client.from("finance_projections").upsert({
    id: PROJECTION_ID,
    revenue: data.revenue,
    expense: data.expense,
    company_pct: data.companyPct,
    partners_pct: data.partnersPct,
    payroll_tax_pct: data.payrollTaxPct,
    salaries: data.salaries,
    partner_shares: data.partnerShares,
    quick_profit: data.quickProfit,
    quick_costs: data.quickCosts,
    quick_partners_pct: data.quickPartnersPct,
    quick_team_pct: data.quickTeamPct,
    updated_by: actor?.id ?? null,
    updated_at: new Date().toISOString(),
  });

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "projeção financeira" });
  }

  revalidatePath("/admin/financeiro/projecao");
}
