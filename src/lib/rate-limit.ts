import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // X-Forwarded-For is a comma-separated chain where each hop APPENDS the
    // peer it saw — so the first entry is whatever the original client
    // claimed (fully attacker-controlled: anyone can send their own
    // "X-Forwarded-For: 1.2.3.4" and get a fresh rate-limit bucket every
    // request), while the LAST entry is what Vercel's own edge — the one
    // hop between the client and this function — actually observed. In the
    // normal case (no upstream proxy chain, single clean value from
    // Vercel) first and last are the same value, so this only changes
    // behavior for a header a caller tried to forge.
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Records this submission attempt and reports whether the IP has exceeded
 * `maxAttempts` for this endpoint within the last `windowMinutes`.
 */
export async function checkRateLimit(
  ip: string,
  endpoint: string,
  { maxAttempts = 5, windowMinutes = 60 }: { maxAttempts?: number; windowMinutes?: number } = {}
): Promise<{ limited: boolean }> {
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = admin as any;

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { count } = await client
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("endpoint", endpoint)
    .gte("created_at", since);

  if ((count ?? 0) >= maxAttempts) {
    return { limited: true };
  }

  await client.from("rate_limits").insert({ ip, endpoint });
  return { limited: false };
}

/** Basic bot signals shared by public form endpoints: a filled honeypot
 * field, or a submission that arrived implausibly fast after the form
 * rendered. Callers should respond with a fake success on a hit, rather
 * than a real error, so bots don't learn to adapt. */
export function looksLikeBot(honeypot: unknown, renderedAt: unknown): boolean {
  if (typeof honeypot === "string" && honeypot.trim().length > 0) return true;
  if (typeof renderedAt === "number" && Date.now() - renderedAt < 1500) return true;
  return false;
}
