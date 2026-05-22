import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Benefits — Evolution Edge & Platform Perks",
  description:
    "Discover RahulFitzz benefits: metabolic precision training, giveaways, gym mode, AI coach, community, and Hyderabad gym booking. Built for athletes who refuse average.",
  path: "/benefits",
  keywords: [
    "fitness benefits Hyderabad",
    "RahulFitzz platform perks",
    "transformation program benefits",
  ],
});

export default function BenefitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
