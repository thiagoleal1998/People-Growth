import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, service, message } = body as Record<string, string>;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const payload: LeadInsert = {
      name,
      email,
      phone: phone || null,
      service_interest: service || null,
      message,
      source: "contact_form",
      status: "new",
      notes: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("leads").insert(payload);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
