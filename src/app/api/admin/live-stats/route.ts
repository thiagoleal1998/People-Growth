import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/server";

// Tighter than before (was 5min off page_views.created_at, which only ever
// got ONE row per page load — see migration 076/Analytics.tsx's heartbeat,
// pinged every 60s, so 2 missed pings' worth of grace is enough now and
// gives a more genuinely "live" number).
const VISITOR_WINDOW_MINUTES = 2;
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

  const [{ count: visitorsOnline }, { data: onlineProfiles }] = await Promise.all([
    client.from("visitor_heartbeats").select("*", { count: "exact", head: true }).gte("last_seen_at", visitorSince),
    client.from("user_profiles").select("id, email, role, columnist_id").gte("last_seen_at", staffSince),
  ]);

  const profiles = (onlineProfiles ?? []) as { id: string; email: string; role: "admin" | "columnist"; columnist_id: string | null }[];
  const columnistIds = profiles.map((p) => p.columnist_id).filter((id): id is string => Boolean(id));

  let columnistNames = new Map<string, string>();
  if (columnistIds.length > 0) {
    const { data: columnistsData } = await client.from("columnists").select("id, name").in("id", columnistIds);
    columnistNames = new Map(((columnistsData ?? []) as { id: string; name: string }[]).map((a) => [a.id, a.name]));
  }

  const onlineStaff = profiles.map((p) => ({
    name: (p.columnist_id && columnistNames.get(p.columnist_id)) || p.email,
    role: p.role,
  }));

  return NextResponse.json({ visitorsOnline: visitorsOnline ?? 0, onlineStaff });
}
