import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Supplement Guide — What, When & How",
  description:
    "RahulFitzz supplement guide for Hyderabad athletes: whey, creatine, fish oil, multivitamins, gut health, hair growth stacks — who should use, when, and how.",
  path: "/supplements",
  keywords: [
    "supplements guide India",
    "creatine whey protein when to take",
    "hair growth supplements",
    "gut health probiotics",
    "RahulFitzz",
  ],
});

export default function SupplementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
