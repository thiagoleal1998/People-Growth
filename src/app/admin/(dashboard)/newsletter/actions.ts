"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import { syncNewsletterSubscriber, removeNewsletterSubscriber } from "@/lib/sender-net";
import type { Database } from "@/types/database.types";

type SubStatus = Database["public"]["Tables"]["newsletter_subs"]["Row"]["status"];

export async function updateSubStatus(id: string, status: SubStatus) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: sub } = await client.from("newsletter_subs").select("email, name").eq("id", id).single();
  await client.from("newsletter_subs").update({ status }).eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "assinante newsletter", entityLabel: `${sub?.email} → ${status}` });
  }
  if (sub?.email) {
    if (status === "unsubscribed") await removeNewsletterSubscriber(sub.email);
    else await syncNewsletterSubscriber(sub.email, sub.name);
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
  if (sub?.email) await removeNewsletterSubscriber(sub.email);
  revalidatePath("/admin/newsletter");
}

// One-time backfill for subscribers who signed up before this integration
// existed — everything from here on syncs automatically via the newsletter
// API route and the two actions above.
export async function syncAllToSender(): Promise<{ synced: number }> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data } = await client.from("newsletter_subs").select("email, name").eq("status", "active");
  const subs = (data ?? []) as { email: string; name: string | null }[];

  // Small batches with a short pause between them — Sender's API doesn't
  // document a rate limit, but there's no reason to fire hundreds of
  // requests at once for what's a background admin action, not a
  // user-facing one.
  const BATCH_SIZE = 10;
  for (let i = 0; i < subs.length; i += BATCH_SIZE) {
    const batch = subs.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((s) => syncNewsletterSubscriber(s.email, s.name)));
    if (i + BATCH_SIZE < subs.length) await new Promise((resolve) => setTimeout(resolve, 300));
  }

  const actor = await getCurrentProfile();
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "newsletter", entityLabel: `Sincronizou ${subs.length} inscrito(s) com o Sender.net` });
  }

  return { synced: subs.length };
}
