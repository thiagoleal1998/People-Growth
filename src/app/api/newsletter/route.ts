import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json() as { email: string; name?: string };

    if (!email) {
      return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("newsletter_subs").upsert(
      { email, name: name ?? null, status: "active", source: "website" },
      { onConflict: "email" }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
