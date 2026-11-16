"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, requireFounder } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";

export async function upsertCareerPlan(columnistId: string, formData: FormData) {
  const actor = await getCurrentProfile();
  await requireFounder(actor);

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const payload = {
    columnist_id: columnistId,
    current_summary: String(formData.get("current_summary") ?? "").trim() || null,
    goals: String(formData.get("goals") ?? "").trim() || null,
    next_review_at: String(formData.get("next_review_at") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data: columnist } = await client.from("columnists").select("name").eq("id", columnistId).single();
  await client.from("career_plans").upsert(payload, { onConflict: "columnist_id" });

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "plano de carreira", entityLabel: columnist?.name ?? "" });
  }

  revalidatePath("/admin/empresa");
  redirect("/admin/empresa?tab=rh&saved=1");
}
