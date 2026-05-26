"use client";

import Banner from "@/components/banner";
import Banner_Marquee from "@/components/banner-marquee";
import Manifesto from "@/components/manifesto";
import Misson from "@/components/misson";
import VideoCard from "@/components/videoCard";
import Services from "@/components/ourServices";
import WorkoutLibrary from "@/components/WorkoutLibrary";
import Benefits from "@/components/benefits";
import Marquee from "@/components/marquee";
import Transformation from "@/components/Transformation";
import What_People_Say from "@/components/what_people";
import Gym from "@/components/gym";
import Blog from "@/components/blog";
import Contact from "@/components/contact";
import { FAQ } from "@/components/FAQ";

/** All sections static — avoids blank black gaps on iPhone from lazy chunks. */
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
