/**
 * Harden document fallback — serve /offline instead of Response.error()
 * when network + cache both fail (common after phone calls / flaky mobile data).
 */
const DOCUMENT_FALLBACK = "/offline";
const nativeFallback = self.fallback;

self.fallback = async (payload) => {
  if (nativeFallback) {
    try {
      const response = await nativeFallback(payload);
      if (response && response.type !== "error") return response;
    } catch {
      /* fall through */
    }
  }

  const { destination } = payload;
  if (destination === "document" || destination === "") {
    const cached = await caches.match(DOCUMENT_FALLBACK, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const network = await fetch(DOCUMENT_FALLBACK, { cache: "no-store" });
      if (network.ok) return network;
    } catch {
      /* fall through */
    }
  }

  return Response.error();
};

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || "RahulFitzz update";
  const options = {
    body: data.body || "Open app for latest updates.",
    icon: data.icon || "/icon.png",
    badge: data.badge || "/icon.png",
    tag: data.tag || "rf-campaign",
    data: {
      url: data.url || "/dashboard",
    },
  };

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);
      if (data.campaignId && data.userId) {
        try {
          await fetch("/api/notifications/campaigns/seen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: data.userId,
              campaignId: data.campaignId,
            }),
            credentials: "include",
          });
        } catch {
          /* non-blocking */
        }
      }
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if ("focus" in client && client.url.includes(targetUrl)) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
