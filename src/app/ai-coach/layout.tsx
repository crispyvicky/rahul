import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "AI Fitness Coach",
  description:
    "Get AI-powered workout guidance from RahulFitzz — personalized tips for training, nutrition, and recovery in India.",
  path: "/ai-coach",
  keywords: ["AI fitness coach", "workout assistant India"],
});

export default function AiCoachLayout({ children }: { children: React.ReactNode }) {
  return children;
}
