"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { InstructionItem } from "@/types/database.types";

function revalidateInstructions() {
  revalidatePath("/admin/instrucoes");
  revalidatePath("/autor/instrucoes");
}

export async function createInstructionItem(kind: InstructionItem["kind"], title: string, body: string): Promise<InstructionItem> {
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  if (!cleanTitle || !cleanBody) throw new Error("Preencha o título e o texto.");

  const actor = await getCurrentProfile();
  const supabase = await createClient();
  const client = supabase as any;

  // New items go to the end of their own kind's list — the highest existing
  // sort_order among items of the same kind, plus one.
  const { data: maxRow } = await client.from("instruction_items").select("sort_order").eq("kind", kind).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const nextOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await client.from("instruction_items").insert({ kind, title: cleanTitle, body: cleanBody, sort_order: nextOrder }).select("*").single();
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "create", entityType: kind === "faq" ? "pergunta do FAQ" : "etapa de instrução", entityLabel: cleanTitle });

  revalidateInstructions();
  return data as InstructionItem;
}

export async function updateInstructionItem(id: string, title: string, body: string): Promise<void> {
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  if (!cleanTitle || !cleanBody) throw new Error("Preencha o título e o texto.");

  const actor = await getCurrentProfile();
  const supabase = await createClient();
  const client = supabase as any;
  const { error } = await client.from("instruction_items").update({ title: cleanTitle, body: cleanBody, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "instrução", entityLabel: cleanTitle });

  revalidateInstructions();
}

export async function deleteInstructionItem(id: string, title: string): Promise<void> {
  const actor = await getCurrentProfile();
  const supabase = await createClient();
  const { error } = await (supabase as any).from("instruction_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "instrução", entityLabel: title });

  revalidateInstructions();
}

// Swaps this item's sort_order with its neighbor (within the same kind) in
// the given direction — simple adjacent-swap reorder, no drag UI needed for
// a list this short.
export async function moveInstructionItem(id: string, direction: "up" | "down"): Promise<void> {
  const supabase = await createClient();
  const client = supabase as any;

  const { data: current } = await client.from("instruction_items").select("*").eq("id", id).single();
  if (!current) throw new Error("Item não encontrado.");

  const { data: siblings } = await client.from("instruction_items").select("id, sort_order").eq("kind", current.kind).order("sort_order", { ascending: true });
  const list = (siblings ?? []) as { id: string; sort_order: number }[];
  const index = list.findIndex((i) => i.id === id);
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || neighborIndex < 0 || neighborIndex >= list.length) return;

  const neighbor = list[neighborIndex];
  await client.from("instruction_items").update({ sort_order: neighbor.sort_order }).eq("id", current.id);
  await client.from("instruction_items").update({ sort_order: current.sort_order }).eq("id", neighbor.id);

  revalidateInstructions();
}
