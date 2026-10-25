import { NextRequest, NextResponse } from "next/server";
import { getGovernorRace, getPresidentRace, getSenateRace, UF_IN_RUNOFF, UF_OPTIONS } from "@/lib/tse";

// The home block polls this every minute; the TSE is only ever asked from here.
export async function GET(req: NextRequest) {
  const fallbackUf = UF_IN_RUNOFF[0] ?? "sp";
  const requested = req.nextUrl.searchParams.get("uf") ?? fallbackUf;
  const uf = UF_OPTIONS.some((option) => option.code === requested) ? requested : fallbackUf;
  const [president, governor, senate] = await Promise.all([getPresidentRace(), getGovernorRace(uf), getSenateRace(uf)]);
  return NextResponse.json(
    { uf, president, governor, senate },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" } }
  );
}
