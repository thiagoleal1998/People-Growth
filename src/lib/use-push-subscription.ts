"use client";

import { useEffect, useState } from "react";

export type PushSupport = "checking" | "unsupported" | "ios-needs-install" | "ready";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function isIosSafariNotInstalled(): boolean {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
  if (!isIos) return false;
  // Installed-as-PWA detection: standalone display mode, or the older
  // iOS-specific `navigator.standalone` flag on pre-PWA Safari versions.
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
  return !standalone;
}

// Shared by PushOptIn.tsx (the compact toggle in NotificationBell's
// dropdown) and PushReminderBanner.tsx (the more insistent top-of-page
// banner) — one subscribe/unsubscribe/detect implementation, two UIs.
// Push is opt-in per browser/device, not per account: someone can be
// subscribed on their desktop Chrome and not on their phone, and that's
// fine — src/lib/push.ts sends to every row the user has.
export function usePushSubscription() {
  const [support, setSupport] = useState<PushSupport>("checking");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Feature/platform detection can only run client-side (navigator/window
    // don't exist during SSR), so it has to happen in an effect rather than
    // a lazy useState initializer — the await here just pushes every
    // setState call past a microtask boundary, same as the real async
    // lookups below, instead of calling one synchronously as the effect's
    // very first statement.
    async function detect() {
      await Promise.resolve();
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        setSupport("unsupported");
        return;
      }
      if (isIosSafariNotInstalled()) {
        setSupport("ios-needs-install");
        return;
      }
      setSupport("ready");
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      setSubscribed(Boolean(sub));
    }
    detect();
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Permissão negada no navegador.");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as BufferSource,
      });
      const json = subscription.toJSON();
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      if (!res.ok) throw new Error();
      setSubscribed(true);
    } catch {
      setError("Não deu para ativar. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } catch {
      setError("Não deu para desativar. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  return { support, subscribed, busy, error, enable, disable };
}
