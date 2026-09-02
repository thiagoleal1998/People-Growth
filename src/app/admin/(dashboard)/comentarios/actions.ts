"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Comment } from "@/types/database.types";

export async function updateCommentStatus(id: string, status: Comment["status"]) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("comments").update({ status }).eq("id", id);
  revalidatePath("/admin/comentarios");
  revalidatePath("/[locale]/mea-sententia/[slug]", "page");
}

export async function deleteComment(id: string) {
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", id);
  revalidatePath("/admin/comentarios");
  revalidatePath("/[locale]/mea-sententia/[slug]", "page");
}
