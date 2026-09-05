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
// author name when linked, falling back to their login email otherwise.
export async function resolveActorName(profile: UserProfile): Promise<string> {
  if (!profile.author_id) return profile.email;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: author } = await (supabase as any).from("authors").select("name").eq("id", profile.author_id).single();
  return author?.name || profile.email;
}
