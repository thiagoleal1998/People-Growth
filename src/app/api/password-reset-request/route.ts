import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { sendAdminNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String((body as Record<string, unknown>).email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "password-reset-request", { maxAttempts: 5, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const admin = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = admin as any;

    // Always return the same generic success message regardless of whether
    // the email matches an account, so this endpoint can't be used to probe
    // which addresses have a login here. Only insert + notify when it does.
    const { data: existing } = await client.from("user_profiles").select("id").eq("email", email).maybeSingle();

    if (existing) {
      await client.from("password_reset_requests").insert({ email });

      const { data: config } = await client.from("site_config").select("value").eq("key", "contact_email").maybeSingle();
      const adminEmail = config?.value;
      if (adminEmail) {
        await sendAdminNotification(
          adminEmail,
          `Pedido de redefinição de senha — ${email}`,
          `<p><strong>${email}</strong> pediu para redefinir a senha de acesso ao painel.</p><p>Defina uma nova senha para essa pessoa em Admin → Usuários.</p>`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Password reset request failed:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
