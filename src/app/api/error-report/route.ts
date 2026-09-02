import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import type { Database } from "@/types/database.types";

type ErrorReportInsert = Database["public"]["Tables"]["error_reports"]["Insert"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageUrl, description, email } = body as Record<string, string>;

    if (!pageUrl || !description) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "error-report", { maxAttempts: 10, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const supabase = await createAdminClient();

    const payload: ErrorReportInsert = {
      page_url: pageUrl,
      description,
      email: email || null,
      status: "new",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("error_reports").insert(payload);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error report submission failed:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
