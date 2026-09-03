import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/server";

const VISITOR_WINDOW_MINUTES = 5;
const STAFF_WINDOW_MINUTES = 2;

export async function GET() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = admin as any;

  const visitorSince = new Date(Date.now() - VISITOR_WINDOW_MINUTES * 60 * 1000).toISOString();
  const staffSince = new Date(Date.now() - STAFF_WINDOW_MINUTES * 60 * 1000).toISOString();

  const [{ data: recentViews }, { data: onlineProfiles }] = await Promise.all([
    client.from("page_views").select("visitor_id").gte("created_at", visitorSince),
    client.from("user_profiles").select("id, email, role, author_id").gte("last_seen_at", staffSince),
  ]);

  const visitorsOnline = new Set(((recentViews ?? []) as { visitor_id: string }[]).map((v) => v.visitor_id)).size;

  const profiles = (onlineProfiles ?? []) as { id: string; email: string; role: "admin" | "author"; author_id: string | null }[];
  const authorIds = profiles.map((p) => p.author_id).filter((id): id is string => Boolean(id));

  let authorNames = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: authorsData } = await client.from("authors").select("id, name").in("id", authorIds);
    authorNames = new Map(((authorsData ?? []) as { id: string; name: string }[]).map((a) => [a.id, a.name]));
  }

  const onlineStaff = profiles.map((p) => ({
    name: (p.author_id && authorNames.get(p.author_id)) || p.email,
    role: p.role,
  }));

  return NextResponse.json({ visitorsOnline, onlineStaff });
}
