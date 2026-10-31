"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import { DEFAULT_TEMPLATES, type NotificationTemplateKey } from "@/lib/notify";

export async function updateNotificationTemplate(key: NotificationTemplateKey, input: { title_template: string; body_template: string }): Promise<void> {
  const title_template = input.title_template.trim();
  if (!title_template) throw new Error("O título não pode ficar vazio.");

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { error } = await client
    .from("notification_templates")
    .update({ title_template, body_template: input.body_template.trim() || null, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw new Error(error.message);

  const actor = await getCurrentProfile();
  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "modelo de notificação", entityLabel: key });

  revalidatePath("/admin/configuracoes");
}

// Writes the hardcoded fallback (src/lib/notify.ts's DEFAULT_TEMPLATES)
// back into the row, so "restore default" can never drift from what
// insertNotification() falls back to if the row were ever missing.
export async function resetNotificationTemplate(key: NotificationTemplateKey): Promise<{ title_template: string; body_template: string | null }> {
  const defaults = DEFAULT_TEMPLATES[key];
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { error } = await client
    .from("notification_templates")
    .update({ title_template: defaults.title, body_template: defaults.body, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw new Error(error.message);

  const actor = await getCurrentProfile();
  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "modelo de notificação", entityLabel: `${key} (restaurado)` });

  revalidatePath("/admin/configuracoes");
  return { title_template: defaults.title, body_template: defaults.body };
}
