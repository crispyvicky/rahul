"use client";

import Manifesto from "@/components/manifesto";
import Misson from "@/components/misson";
import Contact from "@/components/contact";

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen pt-24 md:pt-28">
      <Manifesto />
      <Misson />
      <Contact />
    </div>
  );
}
