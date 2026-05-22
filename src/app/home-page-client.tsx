"use client";

import dynamic from "next/dynamic";
import Banner from "@/components/banner";
import Banner_Marquee from "@/components/banner-marquee";
import Manifesto from "@/components/manifesto";
import Misson from "@/components/misson";
import VideoCard from "@/components/videoCard";

const Services = dynamic(() => import("@/components/ourServices"));
const WorkoutLibrary = dynamic(() => import("@/components/WorkoutLibrary"));
const Benefits = dynamic(() => import("@/components/benefits"));
const Marquee = dynamic(() => import("@/components/marquee"));
const Transformation = dynamic(() => import("@/components/Transformation"));
const What_People_Say = dynamic(() => import("@/components/what_people"));
const Gym = dynamic(() => import("@/components/gym"));
const Blog = dynamic(() => import("@/components/blog"));
const Contact = dynamic(() => import("@/components/contact"));
const FAQ = dynamic(() => import("@/components/FAQ").then((m) => ({ default: m.FAQ })));

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
