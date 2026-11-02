"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import { fetchAndRecordAccount, type FollowerFetchResult } from "@/lib/social-followers";
import type { Goal } from "@/types/database.types";

function revalidatePlanos() {
  revalidatePath("/admin/relatorios");
}

// ===== Contas monitoradas =====

export async function createSocialAccount(input: {
  platform: "instagram" | "youtube" | "tiktok" | "x";
  handle: string;
  displayName?: string;
  externalId?: string;
  profileUrl?: string;
}): Promise<void> {
  const actor = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { error } = await client.from("social_accounts").insert({
    platform: input.platform,
    handle: input.handle.trim(),
    display_name: input.displayName?.trim() || null,
    external_id: input.externalId?.trim() || null,
    profile_url: input.profileUrl?.trim() || null,
  });
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "create", entityType: "conta de rede social", entityLabel: `${input.platform} @${input.handle}` });
  revalidatePlanos();
}

export async function updateSocialAccount(
  id: string,
  input: { handle: string; displayName?: string; externalId?: string; profileUrl?: string; isActive: boolean }
): Promise<void> {
  const actor = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { error } = await client
    .from("social_accounts")
    .update({
      handle: input.handle.trim(),
      display_name: input.displayName?.trim() || null,
      external_id: input.externalId?.trim() || null,
      profile_url: input.profileUrl?.trim() || null,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "conta de rede social", entityLabel: input.handle });
  revalidatePlanos();
}

export async function deleteSocialAccount(id: string, label: string): Promise<void> {
  const actor = await getCurrentProfile();
  const supabase = await createClient();
  const { error } = await (supabase as any).from("social_accounts").delete().eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "conta de rede social", entityLabel: label });
  revalidatePlanos();
}

export async function fetchAccountNow(accountId: string): Promise<FollowerFetchResult> {
  const actor = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: account } = await client.from("social_accounts").select("id, platform, handle, external_id, profile_url").eq("id", accountId).single();
  if (!account) return { ok: false, error: "Conta não encontrada." };

  const result = await fetchAndRecordAccount(client, account);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "conta de rede social", entityLabel: `${account.platform} @${account.handle}` });
  revalidatePlanos();
  return result;
}

export async function setManualFollowerCount(accountId: string, count: number): Promise<void> {
  if (!Number.isFinite(count) || count < 0) throw new Error("Número inválido.");

  const actor = await getCurrentProfile();
  if (!actor) throw new Error("Não autenticado.");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { error } = await client.from("social_follower_snapshots").insert({
    account_id: accountId,
    follower_count: Math.round(count),
    source: "manual",
    created_by: actor.id,
  });
  if (error) throw new Error(error.message);
  await client.from("social_accounts").update({ last_fetch_attempted_at: new Date().toISOString(), last_fetch_error: null }).eq("id", accountId);

  await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "conta de rede social", entityLabel: "contagem manual" });
  revalidatePlanos();
}

// ===== Metas =====

export async function createGoal(input: {
  title: string;
  metric: Goal["metric"];
  socialAccountId?: string;
  targetValue: number;
  targetDate: string;
  notes?: string;
}): Promise<void> {
  if (!input.title.trim()) throw new Error("Preencha o título.");
  if (!Number.isFinite(input.targetValue) || input.targetValue <= 0) throw new Error("Valor alvo inválido.");
  if (input.metric === "social_followers" && !input.socialAccountId) throw new Error("Selecione a conta de rede social.");

  const actor = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { error } = await client.from("goals").insert({
    title: input.title.trim(),
    metric: input.metric,
    social_account_id: input.metric === "social_followers" ? input.socialAccountId : null,
    target_value: input.targetValue,
    target_date: input.targetDate,
    notes: input.notes?.trim() || null,
    created_by: actor?.id ?? null,
  });
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "create", entityType: "meta", entityLabel: input.title });
  revalidatePlanos();
}

export async function updateGoal(
  id: string,
  input: { title: string; metric: Goal["metric"]; socialAccountId?: string; targetValue: number; targetDate: string; notes?: string }
): Promise<void> {
  if (!input.title.trim()) throw new Error("Preencha o título.");
  if (!Number.isFinite(input.targetValue) || input.targetValue <= 0) throw new Error("Valor alvo inválido.");
  if (input.metric === "social_followers" && !input.socialAccountId) throw new Error("Selecione a conta de rede social.");

  const actor = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { error } = await client
    .from("goals")
    .update({
      title: input.title.trim(),
      metric: input.metric,
      social_account_id: input.metric === "social_followers" ? input.socialAccountId : null,
      target_value: input.targetValue,
      target_date: input.targetDate,
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "meta", entityLabel: input.title });
  revalidatePlanos();
}

export async function updateGoalStatus(id: string, status: Goal["status"], title: string): Promise<void> {
  const actor = await getCurrentProfile();
  const supabase = await createClient();
  const { error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .from("goals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "meta", entityLabel: title });
  revalidatePlanos();
}

export async function deleteGoal(id: string, title: string): Promise<void> {
  const actor = await getCurrentProfile();
  const supabase = await createClient();
  const { error } = await (supabase as any).from("goals").delete().eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "meta", entityLabel: title });
  revalidatePlanos();
}
