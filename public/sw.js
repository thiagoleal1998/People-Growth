// Web Push service worker — src/lib/push.ts sends { title, body, link, icon }
// as the push payload (see sendPushToUser); this just has to turn that into
// an OS-level notification and, on click, open the right page.
self.addEventListener("push", (event) => {
  console.log("[sw-debug] push event received, hasData:", !!event.data);
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
    console.log("[sw-debug] parsed data:", JSON.stringify(data));
  } catch (err) {
    console.log("[sw-debug] json parse failed:", err && err.message);
    data = {};
  }
  event.waitUntil(
    self.registration
      .showNotification(data.title || "Grupo Festina", {
        body: data.body || "",
        data: { link: data.link || "/" },
      })
      .then(() => console.log("[sw-debug] showNotification resolved OK"))
      .catch((err) => console.log("[sw-debug] showNotification REJECTED:", err && err.message))
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
