import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data } = await client.from("short_links").select("target_url").eq("code", code).maybeSingle();
  if (!data) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Best-effort — a failed click count shouldn't block the redirect itself.
  client.rpc("increment_short_link_clicks", { link_code: code }).then(() => {});

  return NextResponse.redirect(data.target_url, { status: 302 });
}
