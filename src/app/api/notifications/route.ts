import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Session-bound client + RLS (migration 037) — a user only ever sees and
// mutates their own notifications, never anyone else's.

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: notifications }, { count: unreadCount }] = await Promise.all([
    client.from("notifications").select("*").order("created_at", { ascending: false }).limit(20),
    client.from("notifications").select("id", { count: "exact", head: true }).eq("read", false),
  ]);

  return NextResponse.json({ notifications: notifications ?? [], unreadCount: unreadCount ?? 0 });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, all } = body as { id?: string; all?: boolean };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  if (all) {
    await client.from("notifications").update({ read: true }).eq("read", false);
  } else if (id) {
    await client.from("notifications").update({ read: true }).eq("id", id);
  }

  return NextResponse.json({ success: true });
}
