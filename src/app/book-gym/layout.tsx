import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Book a Gym — Hyderabad & India",
  description:
    "Pre-book elite training hubs partnered with RahulFitzz. Find gym slots near Hyderabad and across India.",
  path: "/book-gym",
  keywords: ["gym booking Hyderabad", "fitness gym prebook India"],
});

export default function BookGymLayout({ children }: { children: React.ReactNode }) {
  return children;
}
