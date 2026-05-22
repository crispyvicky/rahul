import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Gym Mode — Live Workout Tracker",
  description:
    "Track sets, reps, and workouts in Gym Mode. RahulFitzz elite training tools for gym sessions in Hyderabad and beyond.",
  path: "/gym-mode",
  keywords: ["gym workout tracker", "fitness app India"],
});

export default function GymModeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
