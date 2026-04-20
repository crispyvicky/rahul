"use client";

import Banner from "@/components/banner";
import Banner_Marquee from "@/components/banner-marquee";
import Manifesto from "@/components/manifesto";
import Misson from "@/components/misson";
import VideoCard from "@/components/videoCard";
import Services from "@/components/ourServices";
import WorkoutLibrary from "@/components/WorkoutLibrary";
import Benefits from "@/components/benefits";
import Personalized_Hub from "@/components/personalized_hub";
import Transformation from "@/components/Transformation";
import What_People_Say from "@/components/what_people";
import Gym from "@/components/gym";
import Blog from "@/components/blog";
import { FAQ } from "@/components/FAQ";
import Marquee from "@/components/marquee";

export default function Home() {
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
            <Personalized_Hub />
            <Marquee />
            <Transformation />
            <What_People_Say />
            <Gym />
            <Blog />
            <FAQ />
        </>
    );
}
