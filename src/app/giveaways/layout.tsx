import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Fitness Giveaways & Leaderboard",
  description:
    "Earn points, climb the RahulFitzz leaderboard, and win fitness prizes. Follow on Instagram, refer friends, and train in Hyderabad, India.",
  path: "/giveaways",
  keywords: ["fitness giveaway India", "Instagram fitness rewards", "leaderboard prizes"],
});

export default function GiveawaysLayout({ children }: { children: React.ReactNode }) {
  return children;
}
