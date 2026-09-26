"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";

export async function deleteAssessment(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: item } = await client.from("leadership_assessments").select("evaluated_name").eq("id", id).single();
  await client.from("leadership_assessments").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "diagnostico", entityLabel: item?.evaluated_name });
  }
  revalidatePath("/admin/diagnosticos");
  redirect("/admin/diagnosticos");
}
