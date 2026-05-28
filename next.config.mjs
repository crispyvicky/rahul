import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // PWA off in dev by default — set ENABLE_PWA_DEV=true in .env.local to test push notifications locally.
  disable:
    process.env.NODE_ENV === "development" && process.env.ENABLE_PWA_DEV !== "true",
  register: true,
  /** Cache platform pages on in-app navigation (Gym Mode, dashboard, etc.) */
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
  customWorkerSrc: "worker",
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    // Avoid forcing an immediate full reload when user returns from a call/tab switch
    skipWaiting: false,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: ({ url: { pathname }, sameOrigin }) =>
          sameOrigin && !pathname.startsWith("/api/"),
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 4,
          expiration: {
            maxEntries: 48,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["web-push"],
  // PWA plugin registers webpack hooks; Next 16 defaults dev to Turbopack — use `npm run dev` (--webpack).
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [70, 75],
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
};

export default withPWA(nextConfig);
