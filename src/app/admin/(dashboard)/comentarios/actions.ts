"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Comment } from "@/types/database.types";

export async function updateCommentStatus(id: string, status: Comment["status"]) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: comment } = await client.from("comments").select("name").eq("id", id).single();
  await client.from("comments").update({ status }).eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "comentário", entityLabel: `${comment?.name} → ${status}` });
  }
  revalidatePath("/admin/comentarios");
  revalidatePath("/[locale]/mea-sententia/[slug]", "page");
}

export async function deleteComment(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: comment } = await client.from("comments").select("name").eq("id", id).single();
  await client.from("comments").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "comentário", entityLabel: comment?.name });
  }
  revalidatePath("/admin/comentarios");
  revalidatePath("/[locale]/mea-sententia/[slug]", "page");
}
