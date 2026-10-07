"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Category } from "@/types/database.types";

// These throw rather than redirect — the category manager is a client component
// living inside a tab of Configurações, not its own page, and calls these directly
// (not through a <form action>) precisely so a mistake here never discards whatever
// the admin has mid-typed in one of the other tabs' fields.

export async function createCategory(input: { name_pt: string; name_en: string; slug: string; color: string }): Promise<Category> {
  const name_pt = input.name_pt.trim();
  if (!name_pt) throw new Error("Dê um nome à categoria.");
  const slug = input.slug.trim() || slugify(name_pt, { lower: true, strict: true });

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data, error } = await client
    .from("categories")
    .insert({ name_pt, name_en: input.name_en.trim() || null, slug, color: input.color.trim() || null })
    .select("*")
    .single();
  if (error) throw new Error(error.code === "23505" ? `Já existe uma categoria com a URL "${slug}".` : error.message);

  const actor = await getCurrentProfile();
  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "create", entityType: "categoria", entityLabel: name_pt });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/[locale]", "layout");
  return data as Category;
}

export async function updateCategory(id: string, input: { name_pt: string; name_en: string; slug: string; color: string }): Promise<void> {
  const name_pt = input.name_pt.trim();
  if (!name_pt) throw new Error("Dê um nome à categoria.");
  const slug = input.slug.trim() || slugify(name_pt, { lower: true, strict: true });

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { error } = await client
    .from("categories")
    .update({ name_pt, name_en: input.name_en.trim() || null, slug, color: input.color.trim() || null })
    .eq("id", id);
  if (error) throw new Error(error.code === "23505" ? `Já existe uma categoria com a URL "${slug}".` : error.message);

  const actor = await getCurrentProfile();
  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "categoria", entityLabel: name_pt });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/[locale]", "layout");
}

export async function deleteCategory(id: string, name: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  // Articles that had this as their primary category keep publishing, just
  // uncategorized (category_id ON DELETE SET NULL); any article_categories
  // rows tagging it as an extra category are cascade-deleted along with it.
  const { error } = await client.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const actor = await getCurrentProfile();
  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "categoria", entityLabel: name });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/[locale]", "layout");
}
