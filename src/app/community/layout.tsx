import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Fitness Community",
  description:
    "Share transformations, connect with RahulFitzz athletes in Hyderabad and across India, and earn community points.",
  path: "/community",
  keywords: ["fitness community India", "transformation posts", "gym community Hyderabad"],
});

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
