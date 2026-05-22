import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Workout Plans & Training Blueprint",
  description:
    "Science-backed hypertrophy and transformation workout plans by RahulFitzz — built for athletes in Hyderabad, India and worldwide.",
  path: "/workout-plans",
  keywords: ["workout plan Hyderabad", "hypertrophy program India", "12 week transformation"],
});

export default function WorkoutPlansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
