// Stub — replaced with a real Web Push send (VAPID + the `web-push`
// package) once push_subscriptions exists and VAPID keys are configured.
// Kept as its own module so src/lib/notify.ts's call site never has to
// change again once that lands.
export async function sendPushToUser(
  _userId: string,
  _payload: { title: string; body: string | null; link: string }
): Promise<void> {
  // no-op for now
}
