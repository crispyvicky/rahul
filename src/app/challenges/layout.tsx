import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Fitness Challenges",
  description:
    "Daily and weekly fitness challenges from RahulFitzz — check in, earn XP, and stay accountable with the Hyderabad fitness community.",
  path: "/challenges",
  keywords: ["fitness challenges India", "workout challenge Hyderabad"],
});

export default function ChallengesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
