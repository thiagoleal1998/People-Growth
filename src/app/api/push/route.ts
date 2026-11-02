import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendConfirmationPush } from "@/lib/push";
import { checkRateLimit } from "@/lib/rate-limit";

// Session-bound client + RLS (migration 068) — a user only ever registers
// or removes their own push subscriptions, never anyone else's. The send
// path (src/lib/push.ts) reads across all users, but goes through
// createAdminClient() instead, same split as every other table in this
// codebase that's written by its owner but read in bulk by the server.

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { limited } = await checkRateLimit(user.id, "push-subscribe", { maxAttempts: 20, windowMinutes: 60 });
  if (limited) return NextResponse.json({ error: "Muitas tentativas — aguarde um pouco." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint as string | undefined;
  const keys = body?.keys as { p256dh?: string; auth?: string } | undefined;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Inscrição inválida." }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ error }, { data: profile }] = await Promise.all([
    client.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: req.headers.get("user-agent"),
      },
      { onConflict: "endpoint" }
    ),
    client.from("user_profiles").select("role").eq("id", user.id).single(),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Confirms, on this same device, that the opt-in actually worked — best-
  // effort (failures are logged inside, never surfaced here); the
  // subscription is already saved either way.
  await sendConfirmationPush({ endpoint, p256dh: keys.p256dh, auth: keys.auth }, profile?.role === "admin" ? "/admin" : "/colunista");

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint as string | undefined;
  if (!endpoint) return NextResponse.json({ error: "Endpoint ausente." }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  await client.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
