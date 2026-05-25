"use client";

import dynamic from "next/dynamic";
import Banner from "@/components/banner";

const Banner_Marquee = dynamic(() => import("@/components/banner-marquee"));
const Manifesto = dynamic(() => import("@/components/manifesto"));
const Misson = dynamic(() => import("@/components/misson"));
const VideoCard = dynamic(() => import("@/components/videoCard"));
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
