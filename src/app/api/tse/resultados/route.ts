import { NextRequest, NextResponse } from "next/server";
import { getGovernorRace, getPresidentRace, UF_OPTIONS } from "@/lib/tse";

// The home block polls this every minute; the TSE is only ever asked from here.
export async function GET(req: NextRequest) {
  const requested = req.nextUrl.searchParams.get("uf") ?? "sp";
  const uf = UF_OPTIONS.some((option) => option.code === requested) ? requested : "sp";
  const [president, governor] = await Promise.all([getPresidentRace(), getGovernorRace(uf)]);
  return NextResponse.json(
    { uf, president, governor },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" } }
  );
}
