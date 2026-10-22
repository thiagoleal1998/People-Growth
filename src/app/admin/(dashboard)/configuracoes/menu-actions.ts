"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";

// Always writes the full current list (not just what changed) — simplest
// correct way to keep order+labels in sync without needing to diff against
// whatever was there before. Delete-then-insert rather than upsert since
// rows for ids no longer present (an item removed in a later app version)
// would otherwise linger forever with no way to clean them up.
export async function saveMenuOrder(panel: "admin" | "autor", items: { id: string; label: string }[]) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  await client.from("menu_items").delete().eq("panel", panel);
  const rows = items
    .map((item, index) => ({ id: item.id, panel, label: item.label.trim(), sort_order: index }))
    .filter((row) => row.label.length > 0);
  if (rows.length > 0) {
    await client.from("menu_items").insert(rows);
  }

  if (actor) {
    await logActivity({
      userId: actor.id,
      userEmail: actor.email,
      action: "update",
      entityType: "menu",
      entityLabel: panel === "admin" ? "Menu do admin" : "Menu do autor",
    });
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/autor", "layout");
}

export async function resetMenuOrder(panel: "admin" | "autor") {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  await client.from("menu_items").delete().eq("panel", panel);
  revalidatePath("/admin", "layout");
  revalidatePath("/autor", "layout");
}
