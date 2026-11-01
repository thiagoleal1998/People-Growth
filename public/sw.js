// Web Push service worker — src/lib/push.ts sends { title, body, link } as
// the push payload (see sendPushToUser); this just has to turn that into an
// OS-level notification and, on click, open the right page.

// Without these two, a new deploy's service worker sits "waiting" until
// every open tab on the site is fully closed — in the meantime, push
// events keep going to the OLD active worker, so a fix like the icon one
// above would silently not apply for anyone who hadn't closed their
// browser. skipWaiting()+clients.claim() make a new version take over
// immediately, on the very next push.
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  // No `icon` option: the site's favicon asset isn't sized for a
  // notification icon (~190KB), and passing it made Chrome's
  // showNotification() resolve without ever actually displaying anything —
  // confirmed by hand. Safer to go without one than risk a silent no-op.
  event.waitUntil(
    self.registration
      .showNotification(data.title || "Grupo Festina", {
        body: data.body || "",
        data: { link: data.link || "/" },
      })
      .catch((err) => console.error("showNotification failed:", err))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data && event.notification.data.link ? event.notification.data.link : "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(link) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
