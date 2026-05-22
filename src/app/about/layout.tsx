import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About RahulFitzz — Fitness Influencer Hyderabad",
  description:
    "Meet RahulFitzz — Hyderabad-based fitness influencer and coach. 165K+ reach, transformation philosophy, and elite training blueprint.",
  path: "/about",
  keywords: ["about RahulFitzz", "fitness influencer Hyderabad bio"],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
