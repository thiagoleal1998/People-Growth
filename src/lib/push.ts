import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";

let vapidConfigured = false;
function ensureVapidConfigured() {
  if (vapidConfigured) return;
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  vapidConfigured = true;
}

// Best-effort — the in-app bell (src/lib/notify.ts's insertNotification,
// which always runs first) is the source of truth; a push failure here
// never blocks or throws back into the caller. Only dead subscriptions
// (the push service itself reporting 404/410 Gone — the user revoked
// permission, uninstalled the browser, etc.) get cleaned up; any other
// error is just logged.
export async function sendPushToUser(userId: string, payload: { title: string; body: string | null; link: string }): Promise<void> {
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;
  ensureVapidConfigured();

  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = admin as any;
  const [{ data: subs }, { data: config }] = await Promise.all([
    client.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", userId),
    client.from("site_config").select("value").eq("key", "favicon_url").single(),
  ]);
  if (!subs || subs.length === 0) return;

  const body = JSON.stringify({ title: payload.title, body: payload.body, link: payload.link, icon: config?.value || undefined });

  await Promise.all(
    subs.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, body);
      } catch (err) {
        const statusCode = (err as { statusCode?: number } | null)?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await client.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("Push send failed:", err);
        }
      }
    })
  );
}

// Fired once, right after a browser/device successfully subscribes (see
// POST /api/push) — confirms, on that same device, that the opt-in
// actually worked. No cleanup-on-404/410 logic needed here: the
// subscription was just created, so a dead-endpoint response would be
// genuinely unexpected rather than the normal "device went away" case
// sendPushToUser handles.
export async function sendConfirmationPush(sub: { endpoint: string; p256dh: string; auth: string }, link: string): Promise<void> {
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;
  ensureVapidConfigured();

  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: config } = await (admin as any).from("site_config").select("value").eq("key", "favicon_url").single();
  const body = JSON.stringify({
    title: "Notificações ativadas",
    body: "Você vai receber avisos aqui a partir de agora.",
    link,
    icon: config?.value || undefined,
  });

  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, body);
  } catch (err) {
    console.error("Confirmation push failed:", err);
  }
}
