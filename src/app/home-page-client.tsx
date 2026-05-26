"use client";

import dynamic from "next/dynamic";
import Banner from "@/components/banner";
import Banner_Marquee from "@/components/banner-marquee";
import Manifesto from "@/components/manifesto";
import Misson from "@/components/misson";
import VideoCard from "@/components/videoCard";

function SectionPlaceholder({ minH = "min-h-[40vh]" }: { minH?: string }) {
  return (
    <div
      className={`w-full bg-[#050505] ${minH} border-b border-white/5`}
      aria-hidden
    />
  );
}

const Services = dynamic(() => import("@/components/ourServices"), {
  loading: () => <SectionPlaceholder minH="min-h-[50vh]" />,
});
const WorkoutLibrary = dynamic(() => import("@/components/WorkoutLibrary"), {
  loading: () => <SectionPlaceholder minH="min-h-[50vh]" />,
});
const Benefits = dynamic(() => import("@/components/benefits"), {
  loading: () => <SectionPlaceholder minH="min-h-[50vh]" />,
});
const Marquee = dynamic(() => import("@/components/marquee"), {
  loading: () => <SectionPlaceholder minH="min-h-[20vh]" />,
});
const Transformation = dynamic(() => import("@/components/Transformation"), {
  loading: () => <SectionPlaceholder minH="min-h-[60vh]" />,
});
const What_People_Say = dynamic(() => import("@/components/what_people"), {
  loading: () => <SectionPlaceholder minH="min-h-[50vh]" />,
});
const Gym = dynamic(() => import("@/components/gym"), {
  loading: () => <SectionPlaceholder minH="min-h-[40vh]" />,
});
const Blog = dynamic(() => import("@/components/blog"), {
  loading: () => <SectionPlaceholder minH="min-h-[40vh]" />,
});
const Contact = dynamic(() => import("@/components/contact"), {
  loading: () => <SectionPlaceholder minH="min-h-[40vh]" />,
});
const FAQ = dynamic(() => import("@/components/FAQ").then((m) => ({ default: m.FAQ })), {
  loading: () => <SectionPlaceholder minH="min-h-[30vh]" />,
});

export default function HomePageClient() {
  return (
    <>
      <Banner />
      <Banner_Marquee />
      <Manifesto />
      <Misson />
      <VideoCard />
      <Services />
      <WorkoutLibrary />
      <Benefits />
      <Marquee />
      <Transformation />
      <What_People_Say />
      <Gym />
      <Blog />
      <Contact />
      <FAQ />
    </>
  );
}
