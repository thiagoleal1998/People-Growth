import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { fetchAndRecordAccount } from "@/lib/social-followers";

// Runs once a day via Vercel Cron (see vercel.json) — same CRON_SECRET
// gate and service-role-client pattern as find-deals/route.ts. Each
// account is fetched inside its own try/catch so one platform failing
// (missing credentials, a down API, an unexpected response) never blocks
// the others from being attempted.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = admin as any;

  const { data: accountsData, error: accountsError } = await client.from("social_accounts").select("id, platform, handle, external_id, profile_url").eq("is_active", true);
  if (accountsError) {
    console.error("[social-followers] failed to load accounts:", accountsError.message);
    return NextResponse.json({ error: accountsError.message }, { status: 500 });
  }

  const accounts = (accountsData ?? []) as { id: string; platform: "instagram" | "youtube" | "tiktok" | "x" | "linkedin" | "whatsapp"; handle: string; external_id: string | null; profile_url: string | null }[];
  let updated = 0;
  const errors: string[] = [];

  for (const account of accounts) {
    try {
      const result = await fetchAndRecordAccount(client, account);
      if (result.ok) updated++;
      else errors.push(`${account.platform} @${account.handle}: ${result.error}`);
    } catch (err) {
      errors.push(`${account.platform} @${account.handle}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ accountsChecked: accounts.length, updated, errors });
}
