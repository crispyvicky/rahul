import { Metadata, Viewport } from "next";
import "../index.css";
import "../App.scss";
import "../variables.scss";
import { Toaster } from "react-hot-toast";
import LayoutRouter from "../components/layout-router";
import AuthProvider from "../components/auth-provider";
import VercelAnalytics from "@/components/vercel-analytics";
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
    <html lang="en-IN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/LOGO.png" />
        <link rel="icon" href="/LOGO.png" type="image/png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <LayoutRouter>{children}</LayoutRouter>
        </AuthProvider>
        <VercelAnalytics />
        <Toaster position="top-center" toastOptions={{ className: "text-sm" }} />
      </body>
    </html>
  );
}
