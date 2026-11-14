"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";

// Fixed id: singleton, same pattern as finance_projections.
const PARAMS_ID = "00000000-0000-0000-0000-000000000001";

export async function savePayoutParams(data: { perArticleRate: number; weeklyRankBonuses: number[] }) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  await client.from("finance_payout_params").upsert({
    id: PARAMS_ID,
    per_article_rate: data.perArticleRate,
    weekly_rank_bonuses: data.weeklyRankBonuses,
    updated_by: actor?.id ?? null,
    updated_at: new Date().toISOString(),
  });

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "parâmetros de remuneração" });
  }

  revalidatePath("/admin/financeiro/parametros");
  revalidatePath("/admin/financeiro");
}
