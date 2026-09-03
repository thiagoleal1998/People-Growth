"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Database } from "@/types/database.types";

type SubStatus = Database["public"]["Tables"]["newsletter_subs"]["Row"]["status"];

export async function updateSubStatus(id: string, status: SubStatus) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: sub } = await client.from("newsletter_subs").select("email").eq("id", id).single();
  await client.from("newsletter_subs").update({ status }).eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "assinante newsletter", entityLabel: `${sub?.email} → ${status}` });
  }
  revalidatePath("/admin/newsletter");
}

export async function deleteSub(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: sub } = await client.from("newsletter_subs").select("email").eq("id", id).single();
  await client.from("newsletter_subs").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "assinante newsletter", entityLabel: sub?.email });
  }
  revalidatePath("/admin/newsletter");
}
