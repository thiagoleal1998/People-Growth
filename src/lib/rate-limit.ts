import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
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
