import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Deal = {
  externalId: string;
  productName: string;
  imageUrl: string | null;
  oldPrice: number;
  newPrice: number;
  productLink: string;
  currency: string;
};

type MLSearchItem = {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  thumbnail: string;
  permalink: string;
};

async function searchMercadoLivre(query: string, minDiscountPct: number): Promise<{ deals: Deal[]; error?: string }> {
  const res = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return { deals: [], error: `Mercado Livre respondeu ${res.status}` };
  const json = (await res.json()) as { results: MLSearchItem[] };
  const deals = (json.results ?? [])
    .filter((item) => {
      if (!item.original_price || item.original_price <= item.price) return false;
      return ((item.original_price - item.price) / item.original_price) * 100 >= minDiscountPct;
    })
    .map((item) => ({
      externalId: item.id,
      productName: item.title,
      imageUrl: item.thumbnail,
      oldPrice: item.original_price!,
      newPrice: item.price,
      productLink: item.permalink,
      currency: "BRL",
    }));
  return { deals };
}

// eBay's Browse API needs an OAuth client_credentials token per call — it's
// a free developer registration (no affiliate/business approval), unlike
// Mercado Livre or Amazon. Fetched fresh every run since this cron only
// runs once a day; no need to cache/persist the (short-lived) token.
async function getEbayAccessToken(): Promise<string> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("EBAY_CLIENT_ID/EBAY_CLIENT_SECRET não configurados");

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });
  if (!res.ok) throw new Error(`eBay OAuth respondeu ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

type EbaySearchItem = {
  itemId: string;
  title: string;
  price: { value: string; currency: string };
  image?: { imageUrl: string };
  itemWebUrl: string;
  marketingPrice?: { originalPrice: { value: string }; discountPercentage: string };
};

// eBay's catalog is international/USD — a real fallback since it's the
// only marketplace API that works without an approval wait right now, but
// a poor fit for a Brazilian audience compared to Mercado Livre.
// marketingPrice (with a real discountPercentage) is only present on items
// eBay itself is treating as "on sale", which is exactly what's wanted here.
async function searchEbay(query: string, minDiscountPct: number): Promise<{ deals: Deal[]; error?: string }> {
  let token: string;
  try {
    token = await getEbayAccessToken();
  } catch (err) {
    return { deals: [], error: err instanceof Error ? err.message : String(err) };
  }

  const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=50`, {
    headers: { Authorization: `Bearer ${token}`, "X-EBAY-C-MARKETPLACE-ID": "EBAY_US" },
  });
  if (!res.ok) return { deals: [], error: `eBay respondeu ${res.status}` };
  const json = (await res.json()) as { itemSummaries?: EbaySearchItem[] };
  const deals = (json.itemSummaries ?? [])
    .filter((item) => {
      if (!item.marketingPrice) return false;
      return Number(item.marketingPrice.discountPercentage || 0) >= minDiscountPct;
    })
    .map((item) => ({
      externalId: item.itemId,
      productName: item.title,
      imageUrl: item.image?.imageUrl ?? null,
      oldPrice: Number(item.marketingPrice!.originalPrice.value),
      newPrice: Number(item.price.value),
      productLink: item.itemWebUrl,
      currency: item.price.currency || "USD",
    }));
  return { deals };
}

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

  const rules = (rulesData ?? []) as { id: string; query: string; min_discount_pct: number; marketplace: "mercado_livre" | "ebay" }[];
  let created = 0;
  const errors: string[] = [];

  for (const rule of rules) {
    try {
      const { deals, error } = rule.marketplace === "ebay" ? await searchEbay(rule.query, rule.min_discount_pct) : await searchMercadoLivre(rule.query, rule.min_discount_pct);
      if (error) {
        errors.push(`${rule.query} (${rule.marketplace}): ${error}`);
        continue;
      }
      if (deals.length === 0) continue;

      // Skip items already turned into a promo in a previous run — a plain
      // pre-check instead of relying on an upsert/ON CONFLICT, since the
      // unique index on external_id is partial (WHERE external_id IS NOT
      // NULL) and a bare "ON CONFLICT (external_id)" wouldn't reliably
      // infer it.
      const externalIds = deals.map((d) => d.externalId);
      const { data: existing } = await client.from("promos").select("external_id").in("external_id", externalIds);
      const existingIds = new Set(((existing ?? []) as { external_id: string }[]).map((e) => e.external_id));
      const newDeals = deals.filter((d) => !existingIds.has(d.externalId));
      if (newDeals.length === 0) continue;

      const { error: insertError } = await client.from("promos").insert(
        newDeals.map((d) => ({
          source: rule.marketplace,
          external_id: d.externalId,
          product_name: d.productName,
          image_url: d.imageUrl,
          old_price: d.oldPrice,
          new_price: d.newPrice,
          product_link: d.productLink,
          currency: d.currency,
        }))
      );
      if (insertError) {
        errors.push(`${rule.query} (${rule.marketplace}): ${insertError.message}`);
        continue;
      }
      created += newDeals.length;
    } catch (err) {
      errors.push(`${rule.query} (${rule.marketplace}): ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ rulesChecked: rules.length, created, errors });
}
