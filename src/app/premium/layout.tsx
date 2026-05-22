import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Premium Membership",
  description:
    "Unlock RahulFitzz premium — exclusive programs, priority coaching content, and elite member benefits.",
  path: "/premium",
  keywords: ["premium fitness membership", "RahulFitzz premium"],
});

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
