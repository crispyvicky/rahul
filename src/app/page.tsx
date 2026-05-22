import type { Metadata } from "next";
import HomeJsonLd from "@/components/seo/home-json-ld";
import HomePageClient from "./home-page-client";
import { buildPageMetadata, SITE } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: SITE.tagline,
  description: SITE.description,
  path: "/",
  keywords: [
    "RahulFitzz Hyderabad",
    "fitness influencer Telangana",
    "online fitness coach India",
  ],
});

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <HomePageClient />
    </>
  );
}
