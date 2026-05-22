import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Create Account",
  description:
    "Join RahulFitzz free — earn giveaway points, track workouts, and join the fitness community in Hyderabad, India.",
  path: "/signup",
  keywords: ["join fitness platform India", "free fitness account"],
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
