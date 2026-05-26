import { Metadata, Viewport } from "next";
import "../index.css";
import "../App.scss";
import "../variables.scss";
import { Toaster } from "react-hot-toast";
import LayoutRouter from "../components/layout-router";
import AuthProvider from "../components/auth-provider";
import DeferredAnalytics from "@/components/deferred-analytics";
import { fontClassNames, spaceGrotesk } from "@/lib/fonts";
import { buildPageMetadata, OG_IMAGE, SITE, SITE_URL } from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildPageMetadata({
    title: SITE.tagline,
    description: SITE.description,
    path: "/",
  }),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "fitness",
  formatDetection: { email: false, address: false, telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE.name,
  },
  other: {
    "geo.region": "IN-TG",
    "geo.placename": SITE.city,
    "geo.position": `${SITE.geo.latitude};${SITE.geo.longitude}`,
    ICBM: `${SITE.geo.latitude}, ${SITE.geo.longitude}`,
  },
  openGraph: {
    ...buildPageMetadata({
      title: SITE.tagline,
      description: SITE.description,
      path: "/",
    }).openGraph,
    images: [{ url: OG_IMAGE, width: 512, height: 512, alt: `${SITE.name} — ${SITE.city}, India` }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={fontClassNames}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={spaceGrotesk.className} suppressHydrationWarning>
        <AuthProvider>
          <LayoutRouter>{children}</LayoutRouter>
        </AuthProvider>
        <DeferredAnalytics />
        <Toaster position="top-center" toastOptions={{ className: "text-sm" }} />
      </body>
    </html>
  );
}
