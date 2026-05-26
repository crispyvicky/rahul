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
