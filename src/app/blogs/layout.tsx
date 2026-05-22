import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Fitness Blog & Editorial",
  description:
    "RahulFitzz editorial — hypertrophy guides, discipline mindset, nutrition, and transformation insights from a Hyderabad fitness influencer.",
  path: "/blogs",
  keywords: ["fitness blog India", "workout tips Hyderabad", "RahulFitzz editorial"],
});

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
