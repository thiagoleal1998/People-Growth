"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Comment } from "@/types/database.types";

// RLS (migration 020) restricts these to comments on the caller's own
// articles — an author trying to touch someone else's comment is a silent
// no-op, not an error.

export async function updateCommentStatus(id: string, status: Comment["status"], reason?: string | null) {
  const supabase = await createClient();
  const rejection_reason = status === "rejected" ? (reason || null) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("comments").update({ status, rejection_reason }).eq("id", id);
  revalidatePath("/autor/comentarios");
  revalidatePath("/[locale]/conteudo/[slug]", "page");
}

export async function deleteComment(id: string) {
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", id);
  revalidatePath("/autor/comentarios");
  revalidatePath("/[locale]/conteudo/[slug]", "page");
}
