import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MLSearchItem = {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  thumbnail: string;
  permalink: string;
};

// Runs once a day via Vercel Cron (see vercel.json) — this account is on
// the Vercel Hobby plan, which only allows daily cron jobs; hourly needs
// Pro. No session exists here, so every DB call uses the service-role
// client, same as the other request-less code paths in this project
// (publish-scheduled.ts).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = admin as any;

  const { data: rulesData, error: rulesError } = await client.from("promo_search_rules").select("*").eq("active", true);
  if (rulesError) {
    console.error("[find-deals] failed to load search rules:", rulesError.message);
    return NextResponse.json({ error: rulesError.message }, { status: 500 });
  }

  const rules = (rulesData ?? []) as { id: string; query: string; min_discount_pct: number }[];
  let created = 0;
  const errors: string[] = [];

  for (const rule of rules) {
    try {
      const res = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(rule.query)}`);
      if (!res.ok) {
        errors.push(`${rule.query}: Mercado Livre respondeu ${res.status}`);
        continue;
      }
      const json = (await res.json()) as { results: MLSearchItem[] };
      const deals = (json.results ?? []).filter((item) => {
        if (!item.original_price || item.original_price <= item.price) return false;
        const discountPct = ((item.original_price - item.price) / item.original_price) * 100;
        return discountPct >= rule.min_discount_pct;
      });
      if (deals.length === 0) continue;

      // Skip items already turned into a promo in a previous run — a plain
      // pre-check instead of relying on an upsert/ON CONFLICT, since the
      // unique index on external_id is partial (WHERE external_id IS NOT
      // NULL) and a bare "ON CONFLICT (external_id)" wouldn't reliably
      // infer it.
      const externalIds = deals.map((d) => d.id);
      const { data: existing } = await client.from("promos").select("external_id").in("external_id", externalIds);
      const existingIds = new Set(((existing ?? []) as { external_id: string }[]).map((e) => e.external_id));
      const newDeals = deals.filter((d) => !existingIds.has(d.id));
      if (newDeals.length === 0) continue;

      const { error: insertError } = await client.from("promos").insert(
        newDeals.map((d) => ({
          source: "mercado_livre",
          external_id: d.id,
          product_name: d.title,
          image_url: d.thumbnail,
          old_price: d.original_price,
          new_price: d.price,
          product_link: d.permalink,
        }))
      );
      if (insertError) {
        errors.push(`${rule.query}: ${insertError.message}`);
        continue;
      }
      created += newDeals.length;
    } catch (err) {
      errors.push(`${rule.query}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ rulesChecked: rules.length, created, errors });
}
