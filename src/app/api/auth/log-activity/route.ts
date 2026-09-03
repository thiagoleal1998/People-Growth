import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";

// Called from the client right around sign-in/sign-out, while the session
// cookie is still valid either way (log-activity fires before signOut()
// clears it, and right after signInWithPassword sets it).
export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action === "logout" ? "logout" : "login";

  await logActivity({ userId: profile.id, userEmail: profile.email, action, entityType: "sessão" });

  return NextResponse.json({ success: true });
}
