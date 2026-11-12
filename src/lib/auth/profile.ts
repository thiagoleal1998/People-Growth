import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/database.types";

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("user_profiles").select("*").eq("id", user.id).single();
  return (data as UserProfile) ?? null;
}

// The name shown for a user across tickets/comments/activity: their public
// columnist name when linked, falling back to their login email otherwise.
export async function resolveActorName(profile: UserProfile): Promise<string> {
  if (!profile.columnist_id) return profile.email;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: columnist } = await (supabase as any).from("columnists").select("name").eq("id", profile.columnist_id).single();
  return columnist?.name || profile.email;
}

// True only for an admin login linked to a columnist row with is_founder —
// RLS on finance_clients/finance_entries already enforces this at the data
// layer (current_user_is_founder()), but every /admin/financeiro page also
// checks it here first so a non-founder admin gets a 404, not an empty
// table that reads as "there's just no data yet".
export async function isCurrentUserFounder(profile: UserProfile | null): Promise<boolean> {
  if (!profile || profile.role !== "admin" || !profile.columnist_id) return false;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("columnists").select("is_founder").eq("id", profile.columnist_id).single();
  return Boolean(data?.is_founder);
}

// Call at the top of every /admin/financeiro page/layout.
export async function requireFounder(profile: UserProfile | null): Promise<void> {
  if (!(await isCurrentUserFounder(profile))) notFound();
}
