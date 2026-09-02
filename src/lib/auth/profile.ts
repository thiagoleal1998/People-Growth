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
